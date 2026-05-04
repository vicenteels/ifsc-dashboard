# ifsc-dashboard

Dashboard integrado com Moodle IFSC para verificar tarefas pendentes, filtrar tarefas por Unidade Curricular e data, e visualizar um resumo geral de atividades.

## Configuração (Azure / Docker)

**Frontend (Next.js)**

- O frontend consome o backend via proxy interno do Next.js (`/api/moodle/*`), evitando problemas de CORS e evitando “congelar” `NEXT_PUBLIC_*` no build.
- Configure no App Service (frontend) uma destas variáveis:
  - `API_URL=https://ifsc-backend-app.azurewebsites.net` (recomendado), ou
  - `NEXT_PUBLIC_API_URL=https://ifsc-backend-app.azurewebsites.net`

**Backend (NestJS)**

- Configure `CORS_ORIGIN` com uma ou mais origens (separadas por vírgula), por exemplo:
  - `CORS_ORIGIN=https://ifsc-frontend-app.azurewebsites.net`

## Health check

- Backend: `GET /health` retorna `{ status: "ok", timestamp: "..." }`.
