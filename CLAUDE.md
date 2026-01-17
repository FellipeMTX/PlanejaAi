# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language & Localization

**IMPORTANT:** This application targets Brazilian Portuguese (PT-BR) users.

- All user-facing strings (UI text, labels, messages, placeholders, error messages) must be written in **Portuguese (Brazilian)**
- Variable names, code comments, and technical documentation remain in English
- Examples: "Entrar" not "Sign in", "Criar conta" not "Create account", "E-mail" not "Email"

## Build & Development Commands

```bash
# Start development (all apps)
npm run dev

# Build all apps/packages
npm run build

# Linting and formatting
npm run lint
npm run format
npm run check-types

# Testing
npm run test:backend        # Backend unit tests
npm run test:backend:e2e    # Backend E2E tests

# Database (requires Docker running)
docker compose up -d        # Start PostgreSQL
npm run db:generate         # Generate Prisma client
npm run db:push             # Push schema to database
npm run db:migrate          # Run migrations
npm run db:studio           # Open Prisma Studio
npm run db:seed             # Seed demo data
```

## Architecture Overview

**Monorepo Structure (Turborepo):**
- `apps/backend` - NestJS REST API (port 3001)
- `apps/web` - Next.js 15 frontend (port 3000)
- `packages/database` - Prisma ORM + PostgreSQL client (@repo/database)
- `packages/shared` - Shared DTOs Zod schemas (@repo/shared)

**Tech Stack:** NestJS 11, Next.js 15, React 19, Prisma 6, PostgreSQL 16, TypeScript 5.7

## DTO Strategy

**Input validation:** Zod schemas in `@repo/shared/request-dtos`
```typescript
import { LoginSchema } from '@repo/shared/request-dtos';
```

## Authentication Pattern

- JWT-based with Bearer tokens
- Payload: `{ userId }`
- Decorators: `@Public()` for public routes, `@Authenticated()` for protected routes
- Frontend stores token in HTTP-only cookies via server action (`apps/web/lib/cookies.ts`)

**Key files:**
- `apps/backend/src/modules/auth/auth.guard.ts` - Global JWT guard
- `apps/backend/src/modules/auth/auth.decorators.ts` - @Public(), @Authenticated()
- `apps/web/lib/fetch.ts` - fetchApi() wrapper with automatic token injection

## Error Handling

Custom error classes in `apps/backend/src/errors/err.ts`:
- `SimpleErr(message, status)` - Single error message
- `FieldsErr({ field: messages[] }, status)` - Field-specific errors
- `FromZodErr(zodError)` - Convert Zod validation errors

Response format: `{ statusCode, details: string[], fields: { [field]: string[] } }`

## API Response Format

Frontend uses a typed response wrapper (`apps/web/lib/fetch.ts`):
```typescript
type ApiResponse<T> =
  | { data: T; errors: null; status: number }
  | { data: null; errors: string[]; status: number }
```

## Testing

- E2E tests use `createTestApp()` from `apps/backend/test/test-setup.ts`
- `TestDatabaseManager` handles user/data creation and cleanup between tests
- Tests run sequentially (maxWorkers: 1) for database isolation
- Config: `apps/backend/test/jest-e2e.json`

## Environment Variables

Backend requires: `PORT`, `NODE_ENV`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`, `DATABASE_URL`

Database URL format: `postgresql://postgres:postgres@localhost:5433/planeja_ai`

## Demo Credentials

After running `npm run db:seed`:
- Email: `demo@planeja.ai`
- Password: `demo123`
