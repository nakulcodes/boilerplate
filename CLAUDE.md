# Project Rules

## App-Specific Guidelines

Detailed guidelines for each app are in their own CLAUDE.md files:

- **Frontend**: `apps/frontend/CLAUDE.md` — API client patterns, token handling, route protection, component conventions
- **Backend**: `apps/backend/CLAUDE.md` — command/usecase pattern, entity setup, controller patterns, auth flow

Read these before working on the respective app.

## Thinking Before Doing

- ALWAYS read and understand existing code before modifying anything
- ALWAYS check what utilities, hooks, helpers, and types already exist before creating new ones
- ALWAYS verify how the backend wraps responses (`{ data: T }`) before writing frontend fetch logic
- ALWAYS run TypeScript checks on both frontend and backend before considering any task complete
- NEVER guess at payload shapes — read the backend DTO/entity, then match it on the frontend
- NEVER introduce a new pattern when an existing one covers the use case
- When adding a new endpoint: update `apps/frontend/src/config/api-routes.ts` FIRST, then write the fetch call
- When changing a backend DTO or JWT payload: update the corresponding frontend type in the SAME commit

## Architecture

- **Monorepo**: pnpm workspaces with `apps/frontend`, `apps/backend`, `packages/shared`, `packages/core`
- **Frontend**: Next.js 15 (static export, fully client-side rendered) — no SSR, no server components, no server actions
- **Backend**: NestJS 11 with TypeORM + PostgreSQL
- **Shared Packages**:
  - `@boilerplate/shared` — frontend-safe types, permissions, and utilities (no NestJS dependencies)
  - `@boilerplate/core` — backend-only services (mail, storage, AI, cache) + re-exports from shared
- **Package Manager**: pnpm 9.15.0

## Code Style

- No comments in the codebase — write self-documenting code instead
- No unnecessary complexity — keep it simple
- Follow DRY principles — avoid code duplication
- No over-engineering — only build what's needed right now
- No docstrings, type annotations on obvious code, or inline explanations for clear logic
- No emojis in code or commit messages unless explicitly requested

---

## Frontend (Quick Reference)

Full details in `apps/frontend/CLAUDE.md`.

- All pages MUST be `'use client'` (CSR only)
- No `'use server'`, no `cookies()` from `next/headers`, no Next.js API routes
- Auth protection via `AuthGuard` component, not middleware

### API Call Rules

- Use `fetchApi(API_ROUTES.X.Y)` for authenticated calls — it prepends `API_URL` internally
- Use `fetch(buildApiUrl(API_ROUTES.X.Y))` ONLY for unauthenticated calls (login, register)
- NEVER do `fetchApi(buildApiUrl(...))` — this double-prefixes the URL

### Token Storage

- Tokens stored in **localStorage** via `src/utils/cookies.ts`
- `getToken()`, `setToken()`, `getRefreshToken()`, `setRefreshToken()`, `clearTokens()`
- Auto-refresh on 401 with request queuing built into `fetchApi`

### Component Library

- **shadcn/ui** (new-york style) + **Radix UI** primitives + **Tailwind CSS**
- Add components: `npx shadcn@latest add <component>`
- Icons: `lucide-react`
- All UI primitives in `src/components/ui/` — do not modify unless fixing a bug

### Data Tables

- Use composable shadcn `Table` components (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`)
- Loading state: `TableSkeleton` from `src/components/ui/table-skeleton.tsx`
- No third-party data table library — tables are built with shadcn primitives

### Forms

- **react-hook-form** + **zod** (v4) via `@hookform/resolvers`
- Schemas in `src/schemas/` — `auth.schema.ts`, `role.schema.ts`
- Use `useForm` + `zodResolver` — NEVER raw `useState` for form fields
- Use `isSubmitting` from `formState` — NEVER manual `isLoading` state
- Use `Controller` for non-native inputs (permission picker, custom selects)

### Key Utilities

- `fetchApi<T>(endpoint, options?)` — `src/utils/api-client.ts`
- `useSession()` — `src/contexts/session-context.tsx`
- `usePermissions()` — `src/hooks/use-permissions.ts`
- `toast.success/error/info()` — `src/lib/toast.ts`
- `cn(...classes)` — `src/lib/utils.ts`
- `AuthGuard`, `PermissionGuard` — `src/components/auth/`

---

## Backend (Quick Reference)

Full details in `apps/backend/CLAUDE.md`.

- All endpoints versioned under `/api/v1/`
- Responses wrapped by `ResponseInterceptor` in `{ data: T }` format
- Errors return `{ statusCode, message, timestamp, path }`
- Use the command/usecase pattern for ALL business logic
- Packages must be built before apps can run: `pnpm build:packages`

### Database

`DatabaseModule` is `@Global()` and handles ALL entity registration. Feature modules NEVER call `TypeOrmModule.forFeature()`.

When adding a new entity:
1. Create entity in `src/database/entities/` extending `BaseEntity`
2. Create repository in `src/database/repositories/`
3. Add both to `src/database/db.module.ts` arrays
4. Inject repository in your usecase — no `forFeature` needed

### Command/Usecase Pattern

```
modules/<feature>/usecases/<operation>/
  <operation>.command.ts   — input class with validation decorators
  <operation>.usecase.ts   — @Injectable service with execute(command) method
```

Commands extend `OrganizationCommand` (or `AuthenticatedCommand`). Validate with `Command.create(data)`.

### Endpoints & Pagination

- `POST /users/list` — **paginated**: body `{ page, limit, status?, search? }`, response includes `{ data[], page, limit, total, totalPages, hasNextPage, hasPreviousPage }`
- `GET /roles` — **not paginated**: returns all roles as array
- Auth endpoints (`/auth/*`) are public except `/logout` and `/update-password`
- All other user/role endpoints require specific permissions (see `apps/backend/CLAUDE.md` for full list)

When adding a paginated endpoint: use `BasePaginatedCommand` + `ListPaginationDto` on backend, send `{ page, limit }` in POST body from frontend.
When adding a simple list: use `OrganizationCommand` on backend, GET endpoint, frontend receives array directly.

---

## Shared Packages

### @boilerplate/shared — Frontend-Safe Package

Used by both frontend and backend. Contains no NestJS dependencies.

- `PERMISSIONS_ENUM`, `ALL_PERMISSIONS`, `PERMISSION_GROUPS` — permission constants
- `addHours()`, `addDays()` — date math
- `generateSecureToken()`, `generateInviteToken()`, `generatePasswordResetToken()` — token generators
- `createPaginationMetadata()`, `calculateSkip()` — pagination helpers

### @boilerplate/core — Backend-Only Package

Re-exports everything from `@boilerplate/shared` plus:

- `BaseCommand`, `BaseAuthenticatedCommand`, `BasePaginatedCommand` — command base classes
- `CommandValidationException` — thrown on validation failure
- Mail, Storage, Cache, AI services

---

## TypeScript

- Zero TS errors is mandatory before any commit
- Run `pnpm --filter frontend exec tsc --noEmit` and `pnpm --filter backend exec tsc --noEmit` to verify
- Frontend and backend types must stay aligned — if you change a backend DTO or JWT payload, update the corresponding frontend type in the same change

## Git

### Branch Rules

- NEVER push directly to `main` — always create a feature branch and open a PR
- Branch naming: `<type>/<short-description>` (e.g. `feat/user-invite`, `fix/token-refresh`, `chore/update-deps`)
- Branch types:
  - `feat/` — new features or functionality
  - `fix/` — bug fixes
  - `chore/` — tooling, config, dependency updates, refactors with no behavior change
  - `docs/` — documentation only changes

### Commit Messages

Conventional commits format — prefix every commit message:

- `feat:` — new feature or functionality (e.g. `feat: add role permissions picker`)
- `fix:` — bug fix (e.g. `fix: prevent double URL prefix in fetchApi`)
- `chore:` — tooling, config, deps, no behavior change (e.g. `chore: update eslint config`)
- `refactor:` — code restructuring without behavior change (e.g. `refactor: extract pagination helper`)
- `docs:` — documentation only (e.g. `docs: update CLAUDE.md with endpoint reference`)
- `style:` — formatting, whitespace, prettier (e.g. `style: apply consistent single quotes`)
- `test:` — adding or updating tests

Keep messages concise (1 line), lowercase, no period at the end. If more context is needed, add a blank line then a body paragraph.

### Pre-commit Hook

Husky runs on every commit:
1. `lint-staged` — prettier + eslint on staged files
2. `tsc --noEmit` for frontend
3. `tsc --noEmit` for backend

If the hook fails, fix the issues before committing. Do not bypass with `--no-verify` unless bootstrapping tooling changes.

## Running Locally

```
docker compose -f docker-compose.dev.yml up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- Postgres: localhost:5432 (user/password/boilerplate)
