# Project Rules

## Thinking Before Doing

- ALWAYS read and understand existing code before modifying anything
- ALWAYS check what utilities, hooks, helpers, and types already exist before creating new ones
- ALWAYS verify how the backend wraps responses (`{ data: T }`) before writing frontend fetch logic
- ALWAYS run TypeScript checks on both frontend and backend before considering any task complete
- NEVER guess at payload shapes — read the backend DTO/entity, then match it on the frontend
- NEVER introduce a new pattern when an existing one covers the use case
- When adding a new endpoint: update `src/config/api-routes.ts` FIRST, then write the fetch call
- When changing a backend DTO or JWT payload: update the corresponding frontend type in the SAME commit

## Architecture

- **Monorepo**: pnpm workspaces with `apps/frontend`, `apps/backend`, `packages/core`
- **Frontend**: Next.js 15 (static export, fully client-side rendered) — no SSR, no server components, no server actions
- **Backend**: NestJS 11 with TypeORM + PostgreSQL
- **Shared**: `@boilerplate/core` — commands, types, utilities shared across frontend and backend
- **Package Manager**: pnpm 9.15.0

## Code Style

- No comments in the codebase — write self-documenting code instead
- No unnecessary complexity — keep it simple
- Follow DRY principles — avoid code duplication
- No over-engineering — only build what's needed right now
- No docstrings, type annotations on obvious code, or inline explanations for clear logic
- No emojis in code or commit messages unless explicitly requested

---

## Frontend Rules

- All pages must be `"use client"` components (CSR only)
- No `"use server"`, no `cookies()` from `next/headers`, no Next.js API routes
- `next.config.ts` must keep `output: "export"` and `images.unoptimized: true`
- Components using `useSearchParams()` must be wrapped in `<Suspense>`
- Auth protection via `AuthGuard` component, not middleware

### Frontend: Use What Exists

Before writing new code, use these existing utilities:

**API Calls** — `src/utils/api-client.ts`
- `fetchApi<T>(endpoint, options?)` — handles Bearer token, response unwrapping, error formatting
- ALWAYS use this for every API call, never raw `fetch`

**API Routes** — `src/config/api-routes.ts`
- `API_ROUTES.AUTH.LOGIN`, `.REGISTER`, `.LOGOUT`, `.REFRESH`, `.FORGOT_PASSWORD`, `.RESET_PASSWORD`, `.UPDATE_PASSWORD`, `.GOOGLE_CALLBACK`
- `buildApiUrl(route)` — constructs full URL with base + `/api/v1` prefix
- ALWAYS add new endpoints here, never hardcode URLs

**Cookies** — `src/utils/cookies.ts`
- `getToken()`, `getRefreshToken()` — read from `document.cookie`
- `setToken(token, maxAgeSec?)`, `setRefreshToken(token, maxAgeSec?)` — write to `document.cookie`
- `clearTokens()` — clear both tokens
- ALWAYS use these, never read/write cookies directly

**Auth/JWT** — `src/utils/auth.ts`
- `getUserFromToken(token)` — decodes JWT, validates expiry, returns `JWTPayload | null`

**Session** — `src/contexts/session-context.tsx`
- `useSession()` — returns `{ user, setUser, isLoading, isAuthenticated, logout }`
- SessionProvider initializes from cookie token on mount

**Permissions** — `src/hooks/use-permissions.ts`
- `usePermissions()` — returns `{ hasPermission, hasAnyPermission, hasAllPermissions }`
- Permission values defined in `src/constants/permissions.constants.ts`

**Error Class** — `src/utils/error-class.ts`
- `ApiError(message, statusCode, data?)` — thrown by `fetchApi`, catch in components

**Toast Notifications** — `src/lib/toast.ts`
- `toast.success(title, description?)`, `toast.error(title, description?)`, `toast.info(title, description?)`

**CSS Utility** — `src/lib/utils.ts`
- `cn(...classes)` — merges Tailwind classes (clsx + twMerge)
- `formatDateTime(date)`, `formatDate(date)` — locale-formatted date strings
- `generateAvatarColors(name)`, `getInitials(name)` — for user avatars

**Debounce** — `src/hooks/use-debounce.ts`
- `useDebounce<T>(value, delay)` — returns debounced value

**Auth Components** — `src/components/auth/`
- `AuthGuard` — wraps protected routes, redirects if not authenticated
- `PermissionGuard` — renders children only if user has required permissions

### Frontend: Types

**User Types** — `src/types/user.type.ts`
- `JWTPayload` — `{ userId, email, organizationId, permissions[], firstName?, lastName?, exp?, iat? }`
- `User` — `{ id, email, firstName, lastName, organizationId }`
- `Organization` — `{ id, name }`
- `LoginResponse` — `{ accessToken, refreshToken, user, organization }`
- `UserStatus` — `INVITED | ACTIVE | INACTIVE`
- `getFullName(user)` — formats display name

**Permission Type** — `src/types/permissions.type.ts`
- `Permission` — union type of all `PERMISSIONS_ENUM` values

**Pagination** — `src/types/pagination.type.ts`
- `PaginatedResponse<T>` — `{ success, data[], pagination: { total, page, lastPage } }`

---

## Backend Rules

- All endpoints are versioned under `/api/v1/`
- JWT access token contains: `userId`, `email`, `organizationId`, `permissions`, `firstName`, `lastName`
- Responses are wrapped by `ResponseInterceptor` in `{ data: T }` format
- Errors return `{ statusCode, message, timestamp, path }`
- Use the command/usecase pattern for business logic
- `@boilerplate/core` must be built before backend can run (`pnpm build:packages`)

### Backend: Use What Exists

**Decorators** — `src/shared/decorators/`
- `@RequireAuthentication()` — applies JWT guard + Swagger bearer auth
- `@UserSession()` — parameter decorator, injects `{ userId, email, organizationId, permissions }`
- `@ApiResponse(dto, statusCode?, isArray?)` — Swagger response docs
- `@ApiCommonResponses()` — adds standard error responses to Swagger
- `@ApiOkPaginatedResponse(dto)` — Swagger for paginated endpoints

**Filters** — `src/shared/filters/`
- `GlobalExceptionFilter` — catches all exceptions, returns `{ statusCode, message, errors?, timestamp, path }`

**Interceptors** — `src/shared/framework/`
- `ResponseInterceptor` — wraps all responses in `{ data: T }`
- `LoggingInterceptor` — logs request/response with timing and request ID
- `@ExcludeFromIdempotency()` — excludes endpoint from idempotency checks

**Middleware** — `src/shared/middleware/`
- `RequestIdMiddleware` — generates `req_{uuid}` for request tracing

**DTOs** — `src/shared/dtos/`
- `PaginationRequestDto(defaultLimit?, maxLimit?)` — factory for paginated query params
- `PaginatedResponseDto<T>` — `{ success, payload[], metadata }`
- `ErrorDto` — `{ statusCode, message, timestamp, path }`

**Commands** — `src/shared/commands/`
- `AuthenticatedCommand` — extends BaseCommand, adds `userId`
- `OrganizationCommand` — extends AuthenticatedCommand, adds `organizationId`

**Helpers** — `src/shared/helpers/`
- `createGuid()` — UUID v4
- `capitalize(text)`, `toSentenceCase(text)` — text formatting
- `formatUserName(user)` — returns full name or email
- `escapeRegExp(text)` — escapes regex special characters

**Validators** — `src/shared/validators/`
- `@IsTime12HourFormat()` — validates `HH:MM AM/PM` format

**Transformers** — `src/shared/transformers/`
- `@Trim()` — trims whitespace from string fields
- `@TransformToBoolean()` — converts `"true"`/`"false"` strings to boolean

### Backend: Database

**Repository Pattern** — `DatabaseModule` is `@Global()` and handles ALL entity registration via `TypeOrmModule.forFeature()` once. Feature modules NEVER call `TypeOrmModule.forFeature()` — just inject repositories directly.

When adding a new entity:
1. Create entity in `database/entities/`
2. Create repository in `database/repositories/` (extends `Repository<Entity>`, uses `@InjectRepository`)
3. Add entity to `entities` array in `database/db.module.ts`
4. Add repository to `repositories` array in `database/db.module.ts`
5. Inject repository in your usecase/service — no `forFeature` needed

**Entities** — `database/entities/`
- `BaseEntity` — `id` (UUID), `createdAt`, `updatedAt`
- `UserEntity` — email, password, firstName, lastName, organizationId, status, tokens
- `OrganizationEntity` — name, slug, domain, status, careersPageSettings

**Enums** — `database/enums.ts`
- `UserStatus`: `invited`, `active`, `inactive`
- `OrganizationStatus`: `active`, `inactive`, `suspended`

**Repositories** — `database/repositories/`
- `UserRepository`, `OrganizationRepository` — extend TypeORM Repository, use `@InjectRepository` internally

### Backend: Command/Usecase Pattern

Every business operation follows this structure:
```
usecases/<operation>/
  <operation>.command.ts   — input class with validation decorators
  <operation>.usecase.ts   — @Injectable service with execute(command) method
```

Commands extend `BaseCommand` (or `BaseAuthenticatedCommand` from core).
Validation happens at `Command.create(data)` — throws `CommandValidationException` on failure.

---

## @boilerplate/core — Shared Package

**Commands** — `src/commands/`
- `BaseCommand` — static `create<T>(data)` with class-validator validation
- `BaseAuthenticatedCommand` — adds `userId`, `organizationId`
- `BasePaginatedCommand` — adds `page`, `limit`
- `CommandValidationException` — thrown on validation failure

**Types** — `src/types/`
- `ApiResponse<T>` — `{ success, payload?, metadata?, error?, message? }`
- `PaginatedResponse<T>` — `{ success, payload[], metadata }`
- `PaginationMetadata` — `{ page, limit, total, totalPages, hasNextPage, hasPreviousPage }`

**Utilities** — `src/utils/`
- `addHours(hours, from?)`, `addDays(days, from?)` — date math
- `generateSecureToken(prefix, byteLength?)` — `prefix_hexstring`
- `generateInviteToken()`, `generatePasswordResetToken()` — prefixed tokens
- `encryptIntegrationData(data, key)`, `decryptIntegrationData(encrypted, key)` — AES-256-GCM
- `buildUrl(baseUrl, path)` — joins URLs cleanly
- `createPaginationMetadata(page, limit, total)`, `calculateSkip(page, limit)` — pagination helpers
- `validateEmailDomain(email, domain)`, `extractEmailDomain(email)` — email utils
- `buildSlugFromDomain(domain)` — slug generation

**Services** — `src/services/`
- Mail (Resend/SES with templates), Storage (S3/GCS), Cache (Redis), AI (OpenAI/Google)

---

## TypeScript

- Zero TS errors is mandatory before any commit
- Run `pnpm --filter frontend exec tsc --noEmit` and `pnpm --filter backend exec tsc --noEmit` to verify
- Frontend and backend types must stay aligned — if you change a backend DTO or JWT payload, update the corresponding frontend type in the same change

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
