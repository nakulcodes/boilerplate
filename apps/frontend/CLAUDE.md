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
- NEVER use dynamic routes (e.g. `[id]` folders) — static export does not support them. Use query params instead (e.g. `/roles/edit?id=xxx` instead of `/roles/[id]/edit`)

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
- `USERS.DROPDOWN(options?)` — `GET /users` — **flexible dropdown endpoint**
  - Options: `{ fields?, paginate?, page?, limit?, search? }`
  - Default fields: `id,firstName,lastName,email`
  - Allowed fields: `id`, `firstName`, `lastName`, `email`, `role`
  - Set `paginate: true` for paginated response, omit for all items
- `USERS.INVITE` — `POST /users/invite`
- `USERS.RESEND_INVITE` — `POST /users/resend-invite`
- `USERS.UPDATE(id)` — `PUT /users/:id`
- `USERS.BLOCK(id)` — `POST /users/:id/block`
- `USERS.UNBLOCK(id)` — `POST /users/:id/unblock`
- `USERS.EXPORT(options?)` — `GET /users/export` — download users as CSV or Excel
  - Options: `{ format: 'csv' | 'xlsx', status?, search? }`
  - Use `downloadExport()` utility from `src/utils/download.ts`
- `USERS.IMPORT` — `POST /users/import` — import users from a previously uploaded CSV or Excel file
  - Requires file to be uploaded first via presigned URL (see Storage section below)
  - Use `uploadImport()` utility from `src/utils/download.ts` which handles the full flow

**Storage** (authenticated — use `fetchApi(...)`)
- `STORAGE.UPLOAD_URL(options)` — `GET /storage/upload-url` — get a presigned URL for direct file upload
  - Options: `{ extension: string, type: 'document' | 'image' | 'file' }`
  - Returns `{ signedUrl, path }` where signedUrl is for direct upload and path is for subsequent API calls

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

**Flexible dropdown** (user dropdown): GET with optional pagination:
```typescript
// All users with default fields
const users = await fetchApi<UserDropdownItem[]>(API_ROUTES.USERS.DROPDOWN());

// Custom fields
const users = await fetchApi<UserDropdownItem[]>(
  API_ROUTES.USERS.DROPDOWN({ fields: ['id', 'firstName', 'role'] })
);

// Paginated with search
const result = await fetchApi<UserDropdownPaginatedResponse>(
  API_ROUTES.USERS.DROPDOWN({ paginate: true, page: 1, limit: 20, search: 'john' })
);
// result.data = users, result.total, result.hasNextPage, etc.
```

When the backend wraps in `{ data: T }`, `fetchApi` unwraps it automatically. But for paginated responses that return `{ data: T[], page, total, ... }`, the outer `{ data: ... }` is unwrapped by fetchApi, so you receive `{ data: T[], page, total, ... }` — the inner `data` field is the actual array.

## Pagination Rules (IMPORTANT)

**ALL pagination uses 1-indexed page numbers. First page is page 1, NOT page 0.**

### Rules:

1. **State initialization**: `const [page, setPage] = useState(1)` (NEVER 0)
2. **API requests**: Send `{ page: 1, limit: 10 }` for first page
3. **Pagination controls**: Display "Page 1" for first page (not "Page 0")
4. **Navigation**:
   - Previous: `setPage(p => Math.max(1, p - 1))` (stop at 1)
   - Next: `setPage(p => p + 1)`
   - Disable previous when `page === 1`
   - Disable next when `page >= totalPages`

### Why 1-indexed:

- Backend expects page ≥ 1
- Standard REST convention
- User-friendly display
- Sending page: 0 causes negative database OFFSET errors

### Response from backend:
```typescript
{
  data: T[],
  page: number,        // 1-indexed (1 = first page)
  limit: number,
  total: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPreviousPage: boolean
}
```

### Common Mistakes:

❌ NEVER: `useState(0)`, `{ page: 0 }`, `page === 0`, `Math.max(0, ...)`
✅ ALWAYS: `useState(1)`, `{ page: 1 }`, `page === 1`, `Math.max(1, ...)`

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
- Permission constants re-exported from `@boilerplate/shared` in `src/constants/permissions.constants.ts`
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

## Component Library

This project uses **shadcn/ui** (new-york style) with **Radix UI** primitives and **Tailwind CSS**.

- Config: `components.json` (style: `new-york`, base color: `zinc`)
- Add new components: `npx shadcn@latest add <component>`
- NEVER modify existing `src/components/ui/` files unless fixing a bug — these are shadcn-managed
- Icons: `lucide-react`
- Class merging: `cn()` from `src/lib/utils.ts` (uses `clsx` + `tailwind-merge`)
- Variants: `class-variance-authority` (CVA) — used in Button, Badge, etc.

### Available UI Components

All in `src/components/ui/`:

- **Layout**: `card`, `separator`, `tabs`, `scroll-area`
- **Forms**: `input`, `label`, `button`, `checkbox`, `select`, `multi-select`, `switch`
- **Data Display**: `table`, `table-skeleton`, `badge`, `avatar`, `skeleton`
- **Feedback**: `toast`, `toaster`, `tooltip`, `alert-dialog`, `dialog`
- **Navigation**: `dropdown-menu`, `command`, `popover`
- **Status**: `status-select`

### Feature Components

- `src/components/auth/` — `AuthGuard`, `PermissionGuard`, `LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`
- `src/components/dashboard/` — `DashboardContent`, `DashboardHeader`, `DashboardNav`
- `src/components/roles/` — `PermissionPicker`
- `src/components/error-boundary.tsx` — global error boundary with 401 auto-logout
- `src/components/theme-provider.tsx` — next-themes wrapper

## Data Tables

Tables use the composable shadcn `Table` component (`src/components/ui/table.tsx`), NOT a third-party data table library.

### Table Components

```typescript
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
```

### Loading State

Use `TableSkeleton` from `src/components/ui/table-skeleton.tsx` as a placeholder while data loads.

### Pattern for List Pages

```typescript
const [data, setData] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchApi<Item[]>(API_ROUTES.ITEMS.LIST)
    .then(setData)
    .finally(() => setIsLoading(false));
}, []);

if (isLoading) return <TableSkeleton />;

return (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell><Badge>{item.status}</Badge></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
```

## Forms (react-hook-form + zod)

All forms use **react-hook-form** with **zod** validation via `@hookform/resolvers`.

### Zod Schemas

Schemas live in `src/schemas/`:

- `auth.schema.ts` — `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- `role.schema.ts` — `roleSchema`

When adding a new form, create a schema in the appropriate file (or a new file in `src/schemas/`). Always export the inferred type alongside the schema:

```typescript
import { z } from 'zod/v4';

export const mySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
});

export type MyFormData = z.infer<typeof mySchema>;
```

### Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, MyFormData } from '@/schemas/my.schema';

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<MyFormData>({
  resolver: zodResolver(mySchema),
  defaultValues: { name: '', email: '' },
});

const onSubmit = async (data: MyFormData) => {
  await fetchApi(API_ROUTES.MY.CREATE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <Input {...register('name')} />
    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
    <Button type="submit" disabled={isSubmitting}>Submit</Button>
  </form>
);
```

### Controller Pattern (for non-native inputs)

Use `Controller` for components that don't support `ref` (like `PermissionPicker`, custom selects):

```typescript
import { Controller } from 'react-hook-form';

<Controller
  name="permissions"
  control={control}
  render={({ field }) => (
    <PermissionPicker
      selected={field.value}
      onChange={field.onChange}
    />
  )}
/>
```

### Form Rules

- NEVER use raw `useState` for form fields — use `useForm` + zod
- NEVER use manual `isLoading` state for form submission — use `isSubmitting` from `formState`
- Always provide `defaultValues` in `useForm`
- Use `reset()` to populate form with fetched data (edit pages)
- Show field errors with `errors.fieldName?.message`
- For cross-field validation (e.g. confirm password), use `.refine()` on the schema

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

## File Uploads

File uploads use presigned URLs for direct upload to cloud storage. This keeps large files off the backend server and improves performance.

**How the presigned URL flow works:**

1. Frontend requests a presigned URL from the backend by calling the storage upload-url endpoint with the file extension and type
2. Backend returns a signed URL for direct upload and a storage path
3. Frontend uploads the file directly to cloud storage using the signed URL with a PUT request
4. Frontend then calls the relevant API endpoint with the storage path to process the uploaded file

**For user imports**, the `uploadImport()` utility in `src/utils/download.ts` handles this entire flow automatically. Just pass the file and it will get the presigned URL, upload directly to storage, and then call the import endpoint.

**When adding new file upload features**, follow the same pattern: get presigned URL, upload directly, then call API with path. Do not send file buffers directly to the backend.

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:4000`)
- `NEXT_PUBLIC_DEV_BYPASS_PERMISSIONS` — set to `'true'` to bypass permission checks

## Linting

- ESLint with `next/core-web-vitals`, `next/typescript`, and `prettier`
- Run: `pnpm --filter frontend lint`
- TypeScript: `pnpm --filter frontend exec tsc --noEmit`
