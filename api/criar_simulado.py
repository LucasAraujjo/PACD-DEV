"""
Serverless function para criar novo simulado
Endpoint: POST /api/criar-simulado
"""
import os
import json
import random
from datetime import datetime
from http.server import BaseHTTPRequestHandler

import gspread
from google.oauth2.service_account import Credentials


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

SPREADSHEET_NAME = "PACD_DADOS"


def get_google_credentials():
    return Credentials.from_service_account_info(
        {
            "type": os.environ.get("GOOGLE_TYPE", "service_account"),
            "project_id": os.environ["GOOGLE_PROJECT_ID"],
            "private_key_id": os.environ["GOOGLE_PRIVATE_KEY_ID"],
            "private_key": os.environ["GOOGLE_PRIVATE_KEY"].replace("\\n", "\n"),
            "client_email": os.environ["GOOGLE_CLIENT_EMAIL"],
            "client_id": os.environ["GOOGLE_CLIENT_ID"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.environ['GOOGLE_CLIENT_EMAIL']}",
        },
        scopes=SCOPES
    )


def gerar_id_simulado():
    base = datetime.now().strftime("%H%M%S")
    rand = random.randint(0, 9)
    return f"SIM{base}{rand}"


def inserir_simulado(id_atividade, dados):
    creds = get_google_credentials()
    client = gspread.authorize(creds)
    planilha = client.open(SPREADSHEET_NAME)
    aba = planilha.worksheet("simulados")

    id_simulado = gerar_id_simulado()
    data_execucao = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    linha = [
        id_simulado,
        id_atividade,
        dados.get("area", ""),
        dados.get("questoes", ""),
        dados.get("acertos", ""),
        dados.get("tempo_total", ""),
        dados.get("comentarios", ""),
        dados.get("dt_realizado", ""),
        data_execucao
    ]

    aba.append_row(linha)

    return {
        "id_simulado": id_simulado,
        "id_atividade": id_atividade
    }


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            dados = json.loads(body.decode("utf-8"))

            id_atividade = dados.get("id_atividade")
            if not id_atividade:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "id_atividade é obrigatório"
                }).encode())
                return

            resultado = inserir_simulado(id_atividade, dados)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            self.wfile.write(json.dumps({
                "success": True,
                "data": resultado
            }).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e)
            }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

if __name__ == '__main__':
    data_execucao = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    param = {
        "area": "Linguagens",
        "questoes": 45,
        "acertos": 42,
        "tempo_total": "02:00",
        "comentarios": "Teste criar_simulado",
        "dt_realizado": '01/01/2025'
    }

    inserir_simulado(12391, param)