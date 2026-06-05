# TICTICTAC MVP

## Pré-requisitos
- Node.js 18+
- npm

## Como rodar

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Servidor disponível em: http://localhost:3001

### 2. Frontend (outro terminal)
```bash
cd frontend
npm install
npm run dev
```
App disponível em: http://localhost:5173

## Endpoints da API
- GET  /api/participantes — lista todos
- POST /api/participantes — cria novo (body: { nome, email, area })

## Recursos
- Cadastro de participantes
- API REST com Express
- Frontend React + Vite + TypeScript
- Dados em memória (sem banco de dados)
