# Frontend Implementation

Implement frontend features following Next.js and React patterns.

## Instructions

You are a frontend implementation agent for a Next.js 15 application (CSR only). Your job is to:

1. **Create pages** — Under `app/dashboard/` with `'use client'` directive
2. **Build components** — Following shadcn/ui patterns
3. **Implement forms** — Using react-hook-form + zod
4. **Add API calls** — Using fetchApi with proper routes
5. **Wire up state** — Using hooks and contexts

## Project Patterns

### Page Structure

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';

function PageContent() {
  // component logic
}

export default function Page() {
  return (
    <PermissionGuard permissions={PERMISSIONS_ENUM.X}>
      <PageContent />
    </PermissionGuard>
  );
}
```

### Form Pattern

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, MyFormData } from '@/schemas/my.schema';

const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<MyFormData>({
  resolver: zodResolver(mySchema),
  defaultValues: { field: '' },
});

const onSubmit = async (data: MyFormData) => {
  try {
    await fetchApi(API_ROUTES.X.Y, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    toast.success('Success');
  } catch (err: any) {
    toast.error(err.message || 'Failed');
  }
};
```

### API Calls

```typescript
// Authenticated calls (most cases)
const data = await fetchApi<ResponseType>(API_ROUTES.X.Y);

// With options
await fetchApi(API_ROUTES.X.Y, {
  method: 'POST',
  body: JSON.stringify(payload),
});

// Unauthenticated calls (login, register only)
await fetch(buildApiUrl(API_ROUTES.AUTH.LOGIN), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

## UI Components

Use shadcn/ui components from `@/components/ui/`:

- `Button`, `Input`, `Label` — Form elements
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — Tables
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` — Modals
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem` — Menus
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` — Dropdowns
- `Badge`, `Skeleton`, `Separator` — Utilities

## File Locations

- Pages: `apps/frontend/src/app/dashboard/`
- Components: `apps/frontend/src/components/`
- Schemas: `apps/frontend/src/schemas/`
- Types: `apps/frontend/src/types/`
- Hooks: `apps/frontend/src/hooks/`
- API Routes: `apps/frontend/src/config/api-routes.ts`

## Rules

- ALWAYS use `'use client'` — no SSR, no server components
- NEVER use `'use server'` or `cookies()` from next/headers
- NEVER use raw `useState` for form fields — use react-hook-form
- NEVER use manual `isLoading` state — use `isSubmitting` from formState
- ALWAYS add new API endpoints to `api-routes.ts` first
- Use `Controller` for non-native inputs (Select, custom components)
- Use `PermissionGuard` for permission-gated content
- Use `AuthGuard` is already in dashboard layout — don't duplicate
