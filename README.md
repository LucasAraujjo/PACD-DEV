# PACD - Portal Ana Clara de Desempenho

Sistema de gestão de atividades de estudo com integração ao Google Sheets e Power BI.

## Arquitetura

### Frontend
- **Framework**: React 18 com Vite
- **Hospedagem**: Vercel (static site)
- **Estilo**: CSS puro, responsivo

### Backend
- **Tipo**: Serverless Functions (Python)
- **Runtime**: Python 3.9
- **Hospedagem**: Vercel Functions
- **Banco de dados**: Google Sheets (via API)

## Estrutura do Projeto

```
pacd/
├── api/                          # Serverless Functions (Python)
│   ├── criar-atividade.py       # Endpoint para criar atividades
│   └── requirements.txt          # Dependências Python
├── src/                          # Frontend React
│   ├── pages/
│   │   └── NovaAtividade.jsx    # Página de criação de atividade
│   ├── styles/
│   │   └── NovaAtividade.css    # Estilos da página
│   ├── App.jsx                   # Componente principal
│   └── main.jsx                  # Entry point
├── index.html                    # HTML base
├── package.json                  # Dependências Node
├── vite.config.js               # Configuração Vite
├── vercel.json                   # Configuração Vercel
└── .env.example                  # Exemplo de variáveis de ambiente
```

## Modelagem de Dados (Google Sheets)

### Planilha: PACD_DADOS

#### Aba: atividades
Armazena dados estruturais das atividades.

| Coluna        | Tipo   | Descrição                          |
|---------------|--------|------------------------------------|
| id_atividade  | String | ID único gerado (timestamp)        |
| titulo        | String | Nome da atividade                  |
| tipo          | String | SIMULADO, LISTA, REVISAO, etc.     |
| data_inicio   | String | Data de início (formato DD/MM/YYYY)|
| comentarios   | String | Observações opcionais              |
| data_inclusao | String | Timestamp de criação               |

#### Aba: simulados
Armazena registros de execução (relacionamento 1:N com atividades).

| Coluna         | Tipo   | Descrição                     |
|----------------|--------|-------------------------------|
| id_simulado    | String | ID único do simulado          |
| id_atividade   | String | FK para atividades            |
| data_execucao  | String | Data da execução              |
| area           | String | Área do conhecimento          |
| questoes       | Number | Número de questões            |
| acertos        | Number | Número de acertos             |
| tempo          | String | Tempo gasto                   |

#### Aba: questoes
(Não implementada nesta versão)

## Fluxo de Dados

```
┌─────────────┐      POST /api/criar-atividade      ┌──────────────────┐
│   Frontend  │─────────────────────────────────────▶│  Vercel Function │
│   (React)   │                                       │    (Python)      │
└─────────────┘                                       └──────────────────┘
       ▲                                                       │
       │                                                       │
       │              JSON Response                            │
       │           {success, id_atividade}                     │
       │                                                       ▼
       │                                              ┌──────────────────┐
       └──────────────────────────────────────────── │  Google Sheets   │
                                                      │   (atividades)   │
                                                      └──────────────────┘
```

### Detalhamento do Fluxo

1. **Usuário preenche formulário** ([NovaAtividade.jsx](src/pages/NovaAtividade.jsx))
   - Título (obrigatório)
   - Tipo (select, obrigatório)
   - Data de início (obrigatório)
   - Comentários (opcional)

2. **Frontend valida e envia** via `fetch` para `/api/criar-atividade`
   - Validação no cliente
   - Feedback visual de loading
   - Tratamento de erros

3. **Serverless Function processa** ([criar-atividade.py](api/criar-atividade.py))
   - Valida dados obrigatórios
   - Autentica com Google Service Account
   - Gera `id_atividade` único (timestamp)
   - Insere linha na aba "atividades"
   - Retorna JSON com sucesso

4. **Frontend exibe resultado**
   - Mensagem de sucesso com ID
   - Limpa formulário
   - Ou exibe erro em caso de falha

## Setup e Deploy

### 1. Configurar Google Service Account

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sheets
4. Crie uma Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Faça download do arquivo JSON com as credenciais
5. Crie uma planilha chamada "PACD_DADOS" no Google Sheets
6. Compartilhe a planilha com o email da Service Account (com permissão de editor)
7. Crie as abas: "atividades", "simulados", "questoes"

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha com os dados do JSON:

```bash
cp .env.example .env
```

Edite `.env` com as credenciais do Service Account.

### 3. Desenvolvimento Local

```bash
# Instalar dependências do frontend
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Nota**: Para testar as serverless functions localmente, você precisará de uma ferramenta como `vercel dev`:

```bash
npm install -g vercel
vercel dev
```

### 4. Deploy na Vercel

#### Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

#### Via Dashboard

1. Conecte seu repositório GitHub na Vercel
2. Configure as variáveis de ambiente no Dashboard:
   - Settings → Environment Variables
   - Adicione todas as variáveis do `.env`
3. Deploy automático a cada push

### 5. Configurar Variáveis na Vercel

No dashboard da Vercel, adicione as seguintes variáveis de ambiente:

- `GOOGLE_TYPE`
- `GOOGLE_PROJECT_ID`
- `GOOGLE_PRIVATE_KEY_ID`
- `GOOGLE_PRIVATE_KEY` (cole toda a chave privada, com `\n` preservados)
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_CLIENT_ID`

## Princípios de Design

1. **Atividade descreve o evento**
   - Apenas dados estruturais, não métricas
   - Não armazena quantidade de questões ou acertos

2. **Simulado descreve o que aconteceu**
   - Registros de execução ao longo do tempo
   - Uma atividade pode ter vários simulados

3. **Somatórios são calculados, não armazenados**
   - Análises no Power BI
   - Sem duplicação de dados derivados

## Próximos Passos

- [ ] Implementar página de registro de simulados
- [ ] Adicionar listagem de atividades
- [ ] Criar dashboard de visualização
- [ ] Implementar autenticação (se necessário)
- [ ] Adicionar testes automatizados

## Tecnologias

- **Frontend**: React 18, Vite
- **Backend**: Python 3.9, Vercel Serverless Functions
- **APIs**: Google Sheets API, Google Auth
- **Deploy**: Vercel
- **BI**: Power BI (consumo externo)

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique se as credenciais do Google estão corretas
2. Confirme que a planilha está compartilhada com a Service Account
3. Verifique os logs no Dashboard da Vercel
