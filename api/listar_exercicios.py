"""
Serverless function para listar atividades do Google Sheets
Endpoint: GET /api/listar-atividades
"""
import os
import json
from http.server import BaseHTTPRequestHandler

import gspread
from google.oauth2.service_account import Credentials

import pandas as pd
from functools import reduce
from collections import defaultdict


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

SPREADSHEET_NAME = "PACD_DADOS"


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


def listar_atividades():
    """
    Lista todas as atividades com seus dados detalhados (simulados e questões)

    Returns:
        list: Lista de atividades com dados completos
    """
    print("📊 Função listar_atividades iniciada")

    try:
        # Conectar ao Google Sheets
        print("🔑 Obtendo credenciais do Google...")
        var_dicCreds = get_google_credentials()
        print("✅ Credenciais obtidas")

        print("🔗 Autorizando cliente gspread...")
        var_objClient = gspread.authorize(var_dicCreds)
        print("✅ Cliente autorizado")

        print(f"📁 Abrindo planilha '{SPREADSHEET_NAME}'...")
        varobjPlanilha = var_objClient.open(SPREADSHEET_NAME)
        print("✅ Planilha aberta")

        # Ler aba 'atividades'
        print("📄 Lendo aba 'atividades'...")
        var_objAbaAtividades = varobjPlanilha.worksheet("atividades")
        var_dicDadosAtividades = var_objAbaAtividades.get_all_records()
        
        var_listColAtividades = ['ID_ATIVIDADE', 'TITULO', 'TIPO', 'DT_INICIO']
        
        var_dfDadosAtividades = pd.DataFrame(columns=var_listColAtividades)
        var_dfDadosAtividades = pd.concat([var_dfDadosAtividades, pd.DataFrame(var_dicDadosAtividades)], ignore_index=True)
        var_dfDadosAtividades = var_dfDadosAtividades.query("TIPO != 'Redação'")
        print(f"✅ {len(var_dicDadosAtividades)} atividades encontradas")

        # Ler aba 'simulados'
        print("📄 Lendo aba 'simulados'...")
        var_dicAbaSimulados = varobjPlanilha.worksheet("simulados")
        var_dicDadosSimulados = var_dicAbaSimulados.get_all_records()
        
        var_listColSimulados = ['ID_SIMULADO', 'ID_ATIVIDADE', 'AREA', 'ACERTOS', 'TEMPO_TOTAL', 'COMENTARIOS', 'DT_REALIZADO']
        
        var_dfDadosSimulados = pd.DataFrame(columns=var_listColSimulados)
        var_dfDadosSimulados = pd.concat([var_dfDadosSimulados, pd.DataFrame(var_dicDadosSimulados)], ignore_index=True)

        print(f"✅ {len(var_dicDadosSimulados)} simulados encontrados")

        # Ler aba 'questoes'
        print("📄 Lendo aba 'questoes'...")
        var_AbaQuestoes = varobjPlanilha.worksheet("questoes")
        var_dicDadosQuestoes = var_AbaQuestoes.get_all_records()
        
        var_listColQuestoes = ['ID_QUESTOES', 'ID_ATIVIDADE', 'AREA', 'MATERIA', 'ASSUNTO', 'QUESTOES', 'ACERTOS', 'TEMPO_TOTAL', 'COMENTARIOS', 'DT_REALIZADO']
        
        var_dfDadosQuestoes = pd.DataFrame(columns=var_listColQuestoes)
        var_dfDadosQuestoes = pd.concat([var_dfDadosQuestoes, pd.DataFrame(var_dicDadosQuestoes)], ignore_index=True)

        print(f"✅ {len(var_dicDadosQuestoes)} questões encontradas")
        
        #####################################################
        # Criação do formato JSON para retornar ao frontend #
        #####################################################
        
        # Cria dicionários onde cada chave começa com uma lista vazia
        var_listSimuladosPorAtividade = defaultdict(list)
        var_listQuestoesPorAtividade = defaultdict(list)
        
        # Cria um dicionário com a chave sendo o id da atividade e o valor uma lista com os simulados atrelados
        for _, row in var_dfDadosSimulados.iterrows():
            var_intIdAtividade = row['ID_ATIVIDADE']
            var_listSimuladosPorAtividade[var_intIdAtividade].append({
                'ID_SIMULADO': row['ID_SIMULADO'],
                'AREA': row['AREA'],
                'QUESTOES': row['QUESTOES'],
                'ACERTOS': row['ACERTOS'],
                'TEMPO_TOTAL': row['TEMPO_TOTAL'],
                'COMENTARIOS': row['COMENTARIOS'],
                'DT_REALIZADO': row['DT_REALIZADO']
            })
            
        # Cria um dicionário com a chave sendo o id da atividade e o valor uma lista com as questoes atreladass    
        for _, row in var_dfDadosQuestoes.iterrows():
            var_listQuestoesPorAtividade[row['ID_ATIVIDADE']].append({
                'ID_QUESTOES': row['ID_QUESTOES'],
                'AREA': row['AREA'],
                'MATERIA': row['MATERIA'],
                'ASSUNTO': row['ASSUNTO'],
                'QUESTOES': row['QUESTOES'],
                'ACERTOS': row['ACERTOS'],
                'TEMPO_TOTAL': row['TEMPO_TOTAL'],
                'COMENTARIOS': row['COMENTARIOS'],
                'DT_REALIZADO': row['DT_REALIZADO']
            })
            
        # Montagem do JSON final

        var_jsonFinal = []

        for _, atividade in var_dfDadosAtividades.iterrows():
            var_intIdAtividade = atividade['ID_ATIVIDADE']
            var_strTipo = atividade['TIPO']


            item = {
                'ID_ATIVIDADE': var_intIdAtividade,
                'TITULO': atividade['TITULO'],
                'TIPO': var_strTipo,
                'QUESTOES': 0,
                'ACERTOS': 0,
                'DT_INICIO': atividade['DT_INICIO'],
                'INFO': []
            }

            if var_strTipo == 'Simulado':
                #Procura pelo var_intIdAtividade na lista de simulados e puxa a lsita inteira do valor
                item['INFO'] = var_listSimuladosPorAtividade.get(var_intIdAtividade, [])

            elif var_strTipo == 'Questões':
                item['INFO'] = var_listQuestoesPorAtividade.get(var_intIdAtividade, [])

            for registro in item['INFO']:
                item['QUESTOES'] += registro['QUESTOES']
                item['ACERTOS']  += registro['ACERTOS']
            
            var_jsonFinal.append(item)

        print(f"✅ {len(var_jsonFinal)} atividades completas montadas")
        return var_jsonFinal

    except Exception as e:
        print(f"❌ ERRO em listar_atividades: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


class handler(BaseHTTPRequestHandler):
    """Handler para Vercel Serverless Functions"""

    def do_GET(self):
        """Processa requisição GET"""
        print("=" * 60)
        print("🚀 INICIANDO PROCESSAMENTO DA REQUISIÇÃO GET")
        print("=" * 60)

        try:
            # Listar atividades
            print("📋 Listando atividades...")
            atividades = listar_atividades()
            print(f"✅ {len(atividades)} atividades retornadas")

            # Retornar sucesso
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            resultado = {
                "success": True,
                "data": atividades,
                "total": len(atividades)
            }

            print(f"📤 Enviando resposta de sucesso")
            self.wfile.write(json.dumps(resultado).encode())
            print("✅ REQUISIÇÃO PROCESSADA COM SUCESSO!")

        except Exception as e:
            print(f"❌ ERRO DURANTE PROCESSAMENTO: {str(e)}")
            print(f"📚 Tipo do erro: {type(e).__name__}")
            import traceback
            print(f"🔍 Traceback completo:")
            traceback.print_exc()

            # Retornar erro
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }
            print(f"📤 Enviando resposta de erro: {error_response}")
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        """Processa requisição OPTIONS para CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
if __name__ == '__main__':
    listar_atividades()
