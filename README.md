# PlanejaAi

Sistema de gerenciamento financeiro pessoal desenvolvido com tecnologias modernas.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Funcionalidades

- **Autenticacao** - Cadastro e login com JWT
- **Carteiras** - Gerencie suas instituicoes financeiras (Nubank, Itau, etc.)
- **Contas** - Acompanhe o saldo de cada conta bancaria
- **Transacoes** - Registre receitas e despesas
- **Categorias** - Organize suas transacoes por categoria
- **Dashboard** - Visualize resumo financeiro

## Stack Tecnologica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Shadcn/ui |
| **Backend** | NestJS 11, Prisma 6, JWT |
| **Database** | PostgreSQL 16 |
| **Monorepo** | Turborepo, npm workspaces |

## Pre-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm 10+

## Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/PlanejaAi.git
cd PlanejaAi

# Instale as dependencias
npm install

# Inicie o banco de dados
docker compose up -d

# Configure o ambiente
cp .env.example apps/backend/.env
cp .env.example apps/web/.env.local

# Gere o Prisma Client e aplique o schema
npm run db:generate
npm run db:push

# (Opcional) Popule o banco com dados de demonstracao
npm run db:seed

# Inicie o desenvolvimento
npm run dev
```

## Acessando a Aplicacao

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

### Credenciais de Demo

Apos executar `npm run db:seed`:

```
Email: demo@planeja.ai
Senha: demo123
```

## Scripts Disponiveis

```bash
npm run dev           # Inicia frontend e backend em modo desenvolvimento
npm run build         # Compila todos os pacotes
npm run lint          # Executa linting
npm run check-types   # Verifica tipos TypeScript
npm run test:backend:e2e  # Executa testes E2E do backend
npm run db:studio     # Abre Prisma Studio
```

## Arquitetura

```
PlanejaAi/
├── apps/
│   ├── backend/          # API NestJS (porta 3001)
│   └── web/              # Frontend Next.js (porta 3000)
├── packages/
│   ├── database/         # Prisma schema e client
│   ├── shared/           # DTOs Zod compartilhados
│   ├── eslint-config/    # Configuracao ESLint
│   └── typescript-config/# Configuracao TypeScript
├── docker-compose.yml    # PostgreSQL container
└── turbo.json            # Configuracao Turborepo
```

## API Endpoints

### Autenticacao
- `POST /auth/signup` - Criar conta
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuario autenticado

### Carteiras
- `GET /wallets` - Listar carteiras
- `POST /wallets` - Criar carteira
- `GET /wallets/:id` - Detalhes da carteira
- `PATCH /wallets/:id` - Atualizar carteira
- `DELETE /wallets/:id` - Excluir carteira

### Contas
- `GET /wallets/:walletId/accounts` - Listar contas da carteira
- `POST /wallets/:walletId/accounts` - Criar conta
- `PATCH /accounts/:id` - Atualizar conta
- `DELETE /accounts/:id` - Excluir conta

### Transacoes
- `GET /transactions` - Listar transacoes
- `GET /transactions/summary` - Resumo financeiro
- `POST /transactions` - Criar transacao
- `PATCH /transactions/:id` - Atualizar transacao
- `DELETE /transactions/:id` - Excluir transacao

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Excluir categoria

## Deploy

### Frontend (Vercel)
1. Conecte o repositorio ao Vercel
2. Configure a variavel `NEXT_PUBLIC_API_URL`
3. Deploy automatico a cada push

### Backend (Railway)
1. Crie um novo projeto no Railway
2. Conecte o repositorio
3. Configure as variaveis de ambiente
4. Deploy automatico

### Banco de Dados (Neon)
1. Crie um banco PostgreSQL no Neon
2. Copie a connection string para `DATABASE_URL`

## Roadmap

- [ ] Cartoes de credito e faturas
- [ ] Cofrinhos (metas de economia)
- [ ] Graficos e relatorios
- [ ] Filtros por periodo
- [ ] PWA / Mobile

## Licenca

MIT

---

Desenvolvido com TypeScript, Next.js, NestJS e muito cafe.
