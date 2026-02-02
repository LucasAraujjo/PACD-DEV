"""
Serverless function para excluir registros no Google Sheets
Endpoint: POST /api/excluir-atividade
"""
import os
import json
from http.server import BaseHTTPRequestHandler

import gspread
from google.oauth2.service_account import Credentials


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

SPREADSHEET_NAME = "PACD_DADOS_DEV"


def get_google_credentials():
    """Cria credenciais do Google a partir de variáveis de ambiente"""
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


def excluir_registro(planilha, aba_nome, id_valor):
    """
    Remove fisicamente uma linha da planilha com base no ID

    Args:
        planilha: objeto Google Sheets
        aba_nome: nome da aba
        id_coluna_index: índice da coluna do ID (1-based)
        id_valor: valor do ID a ser excluído
    """
    print(f"🗑️  Iniciando exclusão em '{aba_nome}' para ID {id_valor}")

    var_objAba = planilha.worksheet(aba_nome)
    var_listaAba = var_objAba.get_all_values()

    for i, linha in enumerate(var_listaAba[1:], start=2):  # pula cabeçalho
        if linha[0] == str(id_valor):
            print(f"❗ Registro encontrado na linha {i}, removendo...")
            var_objAba.delete_rows(i)
            print("✅ Registro removido com sucesso!")
            return True

    print("⚠️ Registro não encontrado")
    return False


def processar_exclusao(dados):
    """
    Processa exclusão baseada no tipo
    """
    print("📊 Função processar_exclusao iniciada")
    print(f"   Dados recebidos: {dados}")

    creds = get_google_credentials()
    client = gspread.authorize(creds)
    var_objPlanilha = client.open(SPREADSHEET_NAME)

    var_strTipo = dados.get("tipo")
    var_intIdRegistro = dados.get("id")

    if var_strTipo == "Atividade":
        return excluir_registro(var_objPlanilha, "atividades", var_intIdRegistro)

    if var_strTipo == "Simulado":
        return excluir_registro(var_objPlanilha, "simulados", var_intIdRegistro)

    if var_strTipo == "Questões":
        return excluir_registro(var_objPlanilha, "questoes", var_intIdRegistro)

    if var_strTipo == "Redação":
        return excluir_registro(var_objPlanilha, "redacoes", var_intIdRegistro)

    raise ValueError("Tipo inválido para exclusão")


class handler(BaseHTTPRequestHandler):
    """Handler para Vercel Serverless Functions"""

    def do_POST(self):
        print("=" * 60)
        print("🚀 INICIANDO EXCLUSÃO DE REGISTRO")
        print("=" * 60)

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            dados = json.loads(body.decode("utf-8"))

            print(f"📦 Payload recebido: {dados}")

            if not dados.get("tipo") or not dados.get("id"):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "Campos obrigatórios: tipo, id"
                }).encode())
                return

            sucesso = processar_exclusao(dados)

            if not sucesso:
                self.send_response(404)
                resposta = {
                    "success": False,
                    "error": "Registro não encontrado"
                }
            else:
                self.send_response(200)
                resposta = {
                    "success": True,
                    "message": "Registro excluído com sucesso"
                }

            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(resposta).encode())

            print("✅ Exclusão finalizada")

        except Exception as e:
            import traceback
            traceback.print_exc()

            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

if __name__ == '__main__':
    param = {
        "id": '17002',
        "tipo": "Atividade"
    }


    processar_exclusao(param)
