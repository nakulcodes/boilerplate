# Frontend Guidelines

## Stack

- Next.js 15 with static export (`output: "export"`) — fully client-side rendered
- Radix UI + shadcn components with Tailwind CSS
- class-variance-authority (CVA) for component variants
- next-themes for dark mode

## Hard Rules

- Every page and interactive component MUST use `'use client'`
- NEVER use `'use server'`, `cookies()` from `next/headers`, or Next.js API routes
- NEVER change `output: "export"` or `images.unoptimized: true` in `next.config.ts`
- Components using `useSearchParams()` MUST be wrapped in `<Suspense>`
- Auth protection via `AuthGuard` component, NEVER middleware
- NEVER hardcode API URLs — use `API_ROUTES` from `src/config/api-routes.ts`
- NEVER use raw `fetch` for authenticated API calls — use `fetchApi()` from `src/utils/api-client.ts`
- NEVER read/write tokens directly — use `getToken()`, `setToken()`, etc. from `src/utils/cookies.ts`

## API Calls

There are two ways to make API calls. Know when to use which:

**`fetchApi(endpoint, options)`** — for all authenticated/data calls:
- Automatically attaches Bearer token from localStorage
- Automatically handles 401 → refresh token → retry
- Automatically unwraps `{ data: T }` response wrapper
- Pass `API_ROUTES.X.Y` directly (fetchApi prepends `API_URL` internally)

```typescript
const roles = await fetchApi<Role[]>(API_ROUTES.ROLES.LIST);
await fetchApi(API_ROUTES.ROLES.DELETE(id), { method: 'DELETE' });
```

**`fetch(buildApiUrl(route), options)`** — only for unauthenticated calls (login, register) or calls that bypass the refresh flow (session context refresh/logout):

```typescript
const response = await fetch(buildApiUrl(API_ROUTES.AUTH.LOGIN), { ... });
```

**NEVER combine both**: `fetchApi(buildApiUrl(...))` causes double URL prefix.

## API Routes Reference

All routes are defined in `src/config/api-routes.ts`. Here's what exists:

**Auth** (unauthenticated — use `fetch(buildApiUrl(...))`)
- `AUTH.LOGIN` — `POST /auth/login`
- `AUTH.REGISTER` — `POST /auth/register`
- `AUTH.REFRESH` — `POST /auth/refresh`
- `AUTH.LOGOUT` — `POST /auth/logout`
- `AUTH.FORGOT_PASSWORD` — `POST /auth/reset/request`
- `AUTH.RESET_PASSWORD` — `POST /auth/reset`
- `AUTH.UPDATE_PASSWORD` — `POST /auth/update-password`

**Users** (authenticated — use `fetchApi(...)`)
- `USERS.ME` — `GET /users/me`
- `USERS.PROFILE` — `PUT /users/profile`
- `USERS.LIST` — `POST /users/list` — **paginated**, body: `{ page, limit, status?, search? }`
- `USERS.INVITE` — `POST /users/invite`
- `USERS.RESEND_INVITE` — `POST /users/resend-invite`
- `USERS.UPDATE(id)` — `PUT /users/:id`
- `USERS.BLOCK(id)` — `POST /users/:id/block`
- `USERS.UNBLOCK(id)` — `POST /users/:id/unblock`

**Roles** (authenticated — use `fetchApi(...)`)
- `ROLES.LIST` — `GET /roles` — **not paginated**, returns all roles
- `ROLES.CREATE` — `POST /roles`
- `ROLES.GET(id)` — `GET /roles/:id`
- `ROLES.UPDATE(id)` — `PUT /roles/:id`
- `ROLES.DELETE(id)` — `DELETE /roles/:id`

## Pagination

Not all list endpoints are paginated. Know the difference:

**Paginated** (user list): POST with body `{ page, limit }`, response includes metadata:
```typescript
const data = await fetchApi<{ data: UserListItem[] }>(
  API_ROUTES.USERS.LIST,
  { method: 'POST', body: JSON.stringify({ page: 1, limit: 50 }) },
);
// data.data = array of users
```
Response shape from backend: `{ data: T[], page, limit, total, totalPages, hasNextPage, hasPreviousPage }`

**Non-paginated** (role list): GET, returns all items as array:
```typescript
const roles = await fetchApi<Role[]>(API_ROUTES.ROLES.LIST);
// roles = array of all roles
```

When the backend wraps in `{ data: T }`, `fetchApi` unwraps it automatically. But for paginated responses that return `{ data: T[], page, total, ... }`, the outer `{ data: ... }` is unwrapped by fetchApi, so you receive `{ data: T[], page, total, ... }` — the inner `data` field is the actual array.

## Adding a New API Endpoint

1. Add the route to `API_ROUTES` in `src/config/api-routes.ts`
2. Use `fetchApi(API_ROUTES.YOUR.ROUTE)` in your component
3. Match the response type to the backend DTO
4. For paginated endpoints, send `{ page, limit }` in body and handle the pagination metadata

## Token Storage

Tokens are stored in **localStorage** (not cookies). The file is named `cookies.ts` for historical reasons but uses `localStorage` exclusively.

- `getToken()` / `setToken(token)` — access token
- `getRefreshToken()` / `setRefreshToken(token)` — refresh token
- `clearTokens()` — remove both

## Auto-Refresh Flow

The `fetchApi` client handles token refresh transparently:

1. Request returns 401
2. If refresh token exists and no refresh is in-flight, call `/auth/refresh`
3. If a refresh is already in-flight, queue the request (prevents thundering herd)
4. On success: store new tokens, retry original request
5. On failure: clear tokens, throw `ApiError(401)`

Session context also attempts refresh on app init when the access token is expired but refresh token exists.

## Session & Auth

- `useSession()` — returns `{ user, setUser, isLoading, isAuthenticated, logout }`
- `SessionProvider` wraps the entire app in root layout
- On mount: decodes access token → if expired, tries refresh → sets user or clears tokens
- `logout()` calls backend `/auth/logout`, clears tokens, redirects to `/`

## Route Protection

```typescript
// Wrap protected layouts with AuthGuard
export default function DashboardLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}

// Wrap permission-gated UI with PermissionGuard
<PermissionGuard permissions={PERMISSIONS_ENUM.ROLE_CREATE}>
  <Button>Create Role</Button>
</PermissionGuard>
```

## Permissions

- `usePermissions()` — returns `{ hasPermission, hasAnyPermission, hasAllPermissions, getScope }`
- Permission constants re-exported from `@boilerplate/core` in `src/constants/permissions.constants.ts`
- `NEXT_PUBLIC_DEV_BYPASS_PERMISSIONS=true` bypasses all permission checks in development
- Scope support: `getScope('users')` returns `'own' | 'team' | 'all' | null`

## Error Handling

- `fetchApi` throws `ApiError(message, statusCode)` on failures
- Catch in components with try/catch, show toast:
  ```typescript
  try {
    await fetchApi(API_ROUTES.ROLES.CREATE, { method: 'POST', body: JSON.stringify(data) });
    toast.success('Role created');
  } catch (err: any) {
    toast.error(err.message || 'Something went wrong');
  }
  ```
- Error boundary catches unhandled 401s, shows countdown, auto-logs out

## Component Conventions

- UI primitives in `src/components/ui/` (shadcn pattern — do not modify unless necessary)
- Feature components in `src/components/<feature>/`
- Use `cn()` from `src/lib/utils.ts` for merging Tailwind classes
- Use `toast.success()`, `toast.error()`, `toast.info()` from `src/lib/toast.ts`
- Use `formatDateTime()`, `formatDate()` from `src/lib/utils.ts`

## Types

- `JWTPayload` — decoded access token: `{ userId, email, organizationId, permissions[], firstName?, lastName? }`
- `LoginResponse` — `{ accessToken, refreshToken, user, organization }`
- `Role` — `{ id, name, permissions[], organizationId, isDefault, createdAt, updatedAt }`
- `PaginatedResponse<T>` — `{ data: T[], pagination: { total, page, lastPage } }`
- `Permission` — union type of all `PERMISSIONS_ENUM` values

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:4000`)
- `NEXT_PUBLIC_DEV_BYPASS_PERMISSIONS` — set to `'true'` to bypass permission checks

## Linting

- ESLint with `next/core-web-vitals`, `next/typescript`, and `prettier`
- Run: `pnpm --filter frontend lint`
- TypeScript: `pnpm --filter frontend exec tsc --noEmit`
