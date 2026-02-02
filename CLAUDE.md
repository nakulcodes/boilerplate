# Project Rules

## Architecture

- **Monorepo**: pnpm workspaces with `apps/frontend`, `apps/backend`, `packages/core`
- **Frontend**: Next.js 15 (static export, fully client-side rendered) — no SSR, no server components, no server actions
- **Backend**: NestJS 11 with TypeORM + PostgreSQL
- **Package Manager**: pnpm 9.15.0

## Code Style

- No comments in the codebase — write self-documenting code instead
- No unnecessary complexity — keep it simple
- Follow DRY principles — avoid code duplication
- No over-engineering — only build what's needed right now
- No docstrings, type annotations on obvious code, or inline explanations for clear logic
- No emojis in code or commit messages unless explicitly requested

## Frontend Rules

- All pages must be `"use client"` components (CSR only)
- No `"use server"`, no `cookies()` from `next/headers`, no Next.js API routes
- Use `src/config/api-routes.ts` for all backend endpoint paths — never hardcode API URLs
- Use `src/utils/cookies.ts` for client-side cookie operations
- Use `src/utils/api-client.ts` for all API calls (handles auth headers and error formatting)
- Auth protection via `AuthGuard` component, not middleware
- Components using `useSearchParams()` must be wrapped in `<Suspense>`
- `next.config.ts` must keep `output: "export"` and `images.unoptimized: true`

## Backend Rules

- All endpoints are versioned under `/api/v1/`
- JWT access token contains: `userId`, `email`, `organizationId`, `permissions`, `firstName`, `lastName`
- Responses are wrapped by `ResponseInterceptor` in `{ data: T }` format
- Errors return `{ statusCode, message, timestamp, path }`
- Use the command/usecase pattern for business logic
- `@boilerplate/core` must be built before backend can run (`pnpm build:packages`)

## TypeScript

- Zero TS errors is mandatory before any commit
- Run `pnpm --filter frontend exec tsc --noEmit` and `pnpm --filter backend exec tsc --noEmit` to verify
- Frontend and backend types must stay aligned — if you change a backend DTO or JWT payload, update the corresponding frontend type

## Git

- Work on feature branches, not `main`
- Commit messages: conventional commits format (`feat:`, `fix:`, `chore:`, etc.)

## Running Locally

```
docker compose -f docker-compose.dev.yml up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- Postgres: localhost:5432 (user/password/boilerplate)
