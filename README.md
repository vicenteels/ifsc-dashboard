# IFScore — Dashboard de Atividades Acadêmicas (IFSC)

[![Build and Deploy to Azure](https://github.com/vicenteels/ifsc-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/vicenteels/ifsc-dashboard/actions/workflows/deploy.yml)
[![Versão](https://img.shields.io/badge/version-v0.1.0-blue)](https://github.com/vicenteels/ifsc-dashboard)
[![Licença](https://img.shields.io/badge/license-UNLICENSED-lightgrey)](#licença)
[![Online](https://img.shields.io/badge/online-ifscore.com.br-success)](https://ifscore.com.br)

Dashboard que centraliza tarefas e questionários do **Moodle do IFSC** em um único lugar — com filtros, status, médias e visão por disciplina.  
Projeto **100% funcional em produção na Azure**: https://ifscore.com.br

> Para estudantes do IFSC que querem uma visão rápida de pendências e prazos.

## Sumário

- [Características](#características)
- [Demo](#demo)
- [Tech stack](#tech-stack)
- [Arquitetura (visão rápida)](#arquitetura-visão-rápida)
- [Pré-requisitos](#pré-requisitos)
- [Instalação local](#instalação-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy na Azure](#deploy-na-azure)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Estrutura de pastas](#estrutura-de-pastas)
- [APIs e integração com Moodle](#apis-e-integração-com-moodle)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [Problemas conhecidos](#problemas-conhecidos)
- [Licença](#licença)
- [Contato e suporte](#contato-e-suporte)

## Características

- 📌 **Dashboard centralizado** com tarefas e questionários
- ✅ **Status de entrega**: pendente, enviada, enviada fora do prazo
- 🧮 **Cálculo automático** da média de questionários
- 🔎 **Filtros** por disciplina e por data de prazo
- ⏰ **Alertas visuais** para prazos urgentes e vencidos
- 📱 **Responsivo de verdade** (desktop, tablet e mobile)
- 🌙☀️ **Dark/Light mode**
- 🔐 **Autenticação via Moodle** (token de Web Service)
- 📊 **Gráficos interativos** por disciplina
- 📲 **Experiência mobile** com toggle de visualização

## Demo

- Acesse a versão em produção: https://ifscore.com.br
- Para testar sem credenciais do Moodle: clique em **Acessar Demo** na tela de login.
  - Um badge **MODO DEMO** aparece no header do dashboard.
  - A sessão demo faz logout automático após **30 minutos** de inatividade.
  - Os dados exibidos (cursos, tarefas e questionários) são **fictícios** e servem apenas para demonstração.

## Tech stack

**Backend**
- NestJS (API REST) + TypeScript

**Frontend**
- Next.js 16 (App Router) + React

**Integração**
- Moodle Web Services (REST) via `moodle_mobile_app`

**Infra/Containers**
- Docker + Azure Container Registry (ACR)

**CI/CD**
- GitHub Actions (build, push e deploy)

**Hospedagem**
- Azure App Service (Web Apps) em containers

## Arquitetura (visão rápida)

- O **frontend** expõe rotas internas em `app/api/moodle/*` para **proxy** do backend, evitando problemas de CORS e evitando “congelar” variáveis `NEXT_PUBLIC_*` no build.
- O **backend** se comunica com o Moodle e normaliza respostas (tarefas, questionários, usuário e cursos).

## Pré-requisitos

- Node.js **20+**
- Docker
- Docker Compose
- Git
- Conta Azure (para deploy) + Azure CLI (opcional, mas recomendado)

## Instalação local

```bash
git clone https://github.com/vicenteels/ifsc-dashboard.git
cd ifsc-dashboard
```

### Instalar dependências (sem Docker)

```bash
cd backend
npm ci
cd ../frontend
npm ci
```

## Variáveis de ambiente

### Backend (`backend/.env`)

Crie um arquivo `backend/.env`:

```dotenv
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

> `CORS_ORIGIN` aceita múltiplas origens separadas por vírgula.

### Frontend (`frontend/.env.local`)

Crie um arquivo `frontend/.env.local`:

```dotenv
# URL do backend (em dev local, geralmente http://localhost:3000)
API_URL=http://localhost:3000

# Alternativa (apenas se você precisar expor no client — evite quando possível)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Como rodar localmente

### 1) Com Docker Compose (recomendado)

O `docker-compose.yml` já sobe:
- API em `http://localhost:3000`
- Frontend em `http://localhost:3001`

```bash
docker compose up --build
```

### 2) Sem Docker (modo desenvolvimento)

**Backend (porta 3000)**

```bash
cd backend
npm run start:dev
```

**Frontend (porta 3001)**

```bash
cd frontend
npm run dev -- -p 3001
```

Links:
- API: `http://localhost:3000/health`
- Frontend: `http://localhost:3001`

## Deploy na Azure

Resumo do processo usado neste repositório:

1. Build das imagens Docker (backend e frontend)
2. Push das imagens no **Azure Container Registry (ACR)**
3. Configuração do container no **Azure App Service** para cada Web App
4. Restart automático dos apps

**Pré-requisitos**
- Resource Group
- ACR configurado (login server / credenciais)
- 2 Web Apps (ex.: `ifsc-backend-app` e `ifsc-frontend-app`) com suporte a container
- Secrets no GitHub (ver seção CI/CD)

**Configurações importantes no App Service**

Frontend (App Service):
- `API_URL=https://<seu-backend>.azurewebsites.net` (recomendado)
  - alternativa: `NEXT_PUBLIC_API_URL=https://<seu-backend>.azurewebsites.net`

Backend (App Service):
- `CORS_ORIGIN=https://<seu-frontend>.azurewebsites.net`

> Referência principal: workflow `./.github/workflows/deploy.yml`.

## CI/CD (GitHub Actions)

Workflow: `./.github/workflows/deploy.yml`

**Como funciona**
- A cada push na branch `main`, o pipeline:
  - autentica na Azure via OIDC (`azure/login`)
  - faz login no ACR
  - build + push das imagens `ifsc-backend:latest` e `ifsc-frontend:latest`
  - atualiza os containers dos Web Apps
  - reinicia os apps

**Secrets necessários**
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `RESOURCE_GROUP`
- `REGISTRY_NAME`
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`

## Estrutura de pastas

```text
.
├─ backend/                 # API NestJS (Moodle -> REST)
│  ├─ src/
│  │  ├─ moodle/            # Controller/Service de integração com Moodle
│  │  └─ main.ts            # CORS e bootstrap
│  └─ Dockerfile            # Build/runner do backend
├─ frontend/                # Next.js (UI + proxy interno)
│  ├─ app/
│  │  ├─ api/moodle/        # Proxy do frontend -> backend
│  │  ├─ dashboard/         # Página do dashboard
│  │  └─ login/             # Tela de login
│  └─ Dockerfile            # Build/runner do frontend
├─ .github/workflows/       # Pipeline de build/deploy
└─ docker-compose.yml       # Ambiente local (API + UI)
```

## APIs e integração com Moodle

### Endpoints principais (backend)

Base local: `http://localhost:3000`

- `GET /health` — health check
- `POST /moodle/login` — retorna `{ token }`
- `GET /moodle/tarefas?token=...&dataInicio=YYYY-MM-DD` — lista tarefas (com filtro opcional)
- `GET /moodle/questionarios?token=...&userid=...` — lista questionários + notas/média
- `GET /moodle/usuario?token=...` — dados do usuário
- `GET /moodle/cursos?token=...` — cursos do usuário

**Modo demo (sem Moodle)**
- `POST /moodle/demo-login` — retorna `{ token, message }`
- `GET /moodle/demo/usuario?token=...` — usuário demo
- `GET /moodle/demo/cursos?token=...` — cursos demo
- `GET /moodle/demo/tarefas?token=...&dataInicio=YYYY-MM-DD` — tarefas demo (com filtro opcional)
- `GET /moodle/demo/questionarios?token=...` — questionários demo

Exemplo de login:

```bash
curl -X POST http://localhost:3000/moodle/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"SEU_USUARIO\",\"password\":\"SUA_SENHA\"}"
```

### Como a integração funciona

- O backend obtém um **token** no Moodle via endpoint `login/token.php` usando o serviço `moodle_mobile_app`.
- Com o token, o backend consome Web Services REST do Moodle e **normaliza** os dados para o dashboard.

### Autenticação

- O fluxo atual usa **token de Web Service** (Moodle), obtido via `POST /moodle/login`.
- Evolução possível: substituir por OAuth/SSO quando disponível oficialmente para o contexto do IFSC.

## Roadmap

- 🔌 Integração com SIGAA (bloqueada hoje por proteção Cloudflare contra scraping)
- 🧩 Integração via API oficial do IFSC, quando disponível
- 🧪 Mais testes automatizados e e2e
- 📈 Melhorias de UX e acessibilidade (a11y)

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Rode o projeto localmente e valide sua mudança
4. Abra um Pull Request descrevendo claramente o objetivo e como testar

Padrões recomendados:
- TypeScript
- ESLint (backend e frontend)
- Commits pequenos e objetivos

## Problemas conhecidos

- SIGAA: não é possível integrar atualmente por causa de proteções do Cloudflare contra scraping; o caminho futuro é via **API oficial**.
- Licença do repositório: este repositório não possui um arquivo `LICENSE` no momento (o `backend/package.json` está como `UNLICENSED`).

## Licença

Atualmente marcada como **UNLICENSED** (sem um arquivo `LICENSE` no repositório).  
Se o objetivo é manter o projeto realmente open source, recomenda-se adicionar uma licença (ex.: MIT) e o arquivo `LICENSE` na raiz.

## Contato e suporte

- Issues: https://github.com/vicenteels/ifsc-dashboard/issues
- Projeto open source — contribuições são bem-vindas.
