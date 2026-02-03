# Backend Guidelines

## Stack

- NestJS 11 with TypeORM + PostgreSQL
- JWT authentication with access/refresh token rotation
- `@boilerplate/core` for shared commands, utilities, and services

## Hard Rules

- All endpoints versioned under `/api/v1/`
- All responses wrapped in `{ data: T }` by `ResponseInterceptor` — NEVER wrap manually
- NEVER call `TypeOrmModule.forFeature()` in feature modules — the global `DatabaseModule` handles it
- NEVER write business logic in controllers — use the command/usecase pattern
- NEVER hardcode secrets — use `ConfigService` and `.env` files
- NEVER skip validation — commands MUST use class-validator decorators
- Every protected endpoint MUST use `@RequireAuthentication()` or `@RequirePermissions()`

## Command/Usecase Pattern

Every business operation follows this structure:

```
modules/<feature>/usecases/<operation>/
  <operation>.command.ts   — input class with validation decorators
  <operation>.usecase.ts   — @Injectable service with execute(command) method
```

**Commands**:
- Extend `OrganizationCommand` for org-scoped operations (provides `userId`, `organizationId`)
- Extend `AuthenticatedCommand` for auth-only operations (provides `userId`)
- Extend `BasePaginatedCommand` for paginated lists (provides `page`, `limit`)
- Use `class-validator` decorators: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, etc.
- Instantiate with `MyCommand.create({ ...data })` — validates automatically, throws `CommandValidationException`

```typescript
export class CreateRoleCommand extends OrganizationCommand {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsArray()
  @IsString({ each: true })
  readonly permissions: string[];
}
```

**Usecases**:
- `@Injectable()` class with a single `execute(command)` method
- Inject repositories directly (no services wrapping repositories)
- Return DTOs or entities — ResponseInterceptor wraps in `{ data: T }`

```typescript
@Injectable()
export class CreateRole {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<RoleEntity> {
    // validate, create, save, return
  }
}
```

## Controller Pattern

```typescript
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.ROLE_CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateRoleDto,
  ) {
    return this.createRole.execute(
      CreateRoleCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        name: dto.name,
        permissions: dto.permissions,
      }),
    );
  }
}
```

- Use `@RequirePermissions(PERMISSIONS_ENUM.X)` for permission-gated endpoints
- Use `@RequireAuthentication()` for auth-only endpoints (no specific permission)
- Use `@UserSession()` to extract `{ userId, email, organizationId, permissions, roleId }` from JWT
- Use `@Body()` with DTO classes for request validation
- Controller methods just bridge HTTP to command/usecase — no logic

## Adding a New Entity

1. Create entity in `src/database/entities/` extending `BaseEntity`
2. Export it from `src/database/entities/index.ts`
3. Create repository in `src/database/repositories/` extending `Repository<Entity>`
4. Export it from `src/database/repositories/index.ts`
5. Add entity to `entities` array in `src/database/db.module.ts`
6. Add repository to `repositories` array in `src/database/db.module.ts`
7. Inject repository directly in usecases — no `forFeature` needed

## Adding a New Feature Module

1. Create directory: `src/modules/<feature>/`
2. Create module, controller, DTOs, and usecases following existing patterns
3. Register module in `src/app.module.ts` imports
4. Add controller endpoints with proper decorators
5. Update frontend `API_ROUTES` and types in the same commit

## Database

**Entities inherit from BaseEntity**:
- `id` — UUID primary key (auto-generated)
- `createdAt` — auto-generated timestamp
- `updatedAt` — auto-updated timestamp

**Key entities**:
- `UserEntity` — email, password (hashed), firstName, lastName, organizationId, roleId, status, refreshToken (select: false)
- `OrganizationEntity` — name, slug (unique), domain (unique), status
- `RoleEntity` — name, permissions (JSONB string[]), organizationId, isDefault

**Enums** (`src/database/enums.ts`):
- `UserStatus`: invited, active, inactive, blocked
- `OrganizationStatus`: active, inactive, suspended

**Multi-tenancy**: Most queries MUST filter by `organizationId` to enforce tenant isolation.

## Authentication

**Access Token** (1h expiry):
- Payload: `{ userId, email, organizationId, permissions[], firstName, lastName, roleId }`
- Sent as `Authorization: Bearer <token>`
- Validated by `JwtAuthGuard` on every protected request

**Refresh Token** (30d expiry):
- Payload: `{ userId, email, organizationId }` (no permissions)
- Stored in database (`refreshToken`, `refreshTokenExpires` columns, select: false)
- Sent in request body to `/auth/refresh`
- Token rotation: new refresh token issued on every refresh, old one invalidated

**Password hashing**: bcrypt with 10 salt rounds via `AuthService`

## Decorators

- `@RequireAuthentication()` — JWT guard + Swagger bearer auth
- `@RequirePermissions(...perms)` — JWT guard + permission guard + Swagger bearer auth
- `@UserSession()` — parameter decorator, extracts `UserSessionData` from request
- `@ApiResponse(dto, statusCode?, isArray?)` — Swagger response docs
- `@ApiCommonResponses()` — standard error responses in Swagger
- `@ApiOkPaginatedResponse(dto)` — paginated response Swagger docs
- `@ExcludeFromIdempotency()` — exclude endpoint from idempotency checks

## Shared Utilities

**Transformers** (`src/modules/shared/transformers/`):
- `@Trim()` — trims whitespace from string DTO fields
- `@TransformToBoolean()` — converts `"true"`/`"false"` strings to boolean

**Validators** (`src/modules/shared/validators/`):
- `@IsTime12HourFormat()` — validates `HH:MM AM/PM`

**Helpers** (`src/modules/shared/helpers/`):
- `createGuid()` — UUID v4
- `capitalize(text)`, `toSentenceCase(text)`
- `formatUserName(user)` — full name or email fallback
- `escapeRegExp(text)`

## Modules Overview

### Auth (`src/modules/auth/`)
Handles authentication, registration, password management, and user impersonation.
- Login/logout with JWT access + refresh token rotation
- User registration (creates org + default admin role)
- Password reset flow with email tokens
- Admin impersonation of other users

### User (`src/modules/user/`)
User management within an organization.
- Invite users (sends invite link, optional role assignment)
- Direct user creation (immediately active with password)
- User profile management
- Block/unblock users
- Paginated user listing with scoped permissions (own/team/all)

### Role (`src/modules/role/`)
Role-based access control management.
- CRUD for roles within an organization
- Permission assignment to roles
- Default role designation

### Shared (`src/modules/shared/`)
Common utilities, decorators, guards, and DTOs used across modules.
- Permission decorators and guards
- Response interceptors
- Pagination helpers
- Validation decorators

## Scoped Permissions

User-related permissions support three scope levels:
- `:own` — can only access users they invited
- `:team` — can access users with the same role
- `:all` — can access all users in the organization

Example: `user:list:read:own`, `user:list:read:team`, `user:list:read:all`

The `PermissionsGuard` uses prefix matching — checking for `user:list:read` will match any of the scoped variants.

## Pagination Pattern

For paginated endpoints (like user list):

1. Create command extending `BasePaginatedCommand` (provides `page`, `limit`)
2. Create DTO extending `ListPaginationDto` (provides `page`, `limit` with validation)
3. In usecase, use `calculateSkip(page, limit)` for offset and `calculatePaginationMetadata(page, limit, total)` for response
4. Use `@ApiOkPaginatedResponse(YourDto)` on the controller method
5. Response shape: `{ data: T[], page, limit, total, totalPages, hasNextPage, hasPreviousPage }`

For simple lists (like roles), return the array directly — ResponseInterceptor wraps it in `{ data: T[] }`.

## Response Format

```
// Success (single)
{ "data": { "id": "...", "name": "..." } }

// Success (array)
{ "data": [{ "id": "..." }, { "id": "..." }] }

// Success (paginated)
{ "data": [...], "page": 1, "limit": 10, "total": 25, "totalPages": 3, "hasNextPage": true, "hasPreviousPage": false }

// Error
{ "statusCode": 400, "message": "Validation failed", "errors": { ... }, "timestamp": "...", "path": "/api/v1/..." }
```

## Permissions

- Defined in `@boilerplate/core` as `PERMISSIONS_ENUM`
- Stored in `RoleEntity.permissions` as JSONB string array
- Included in JWT access token payload
- Checked per-endpoint via `@RequirePermissions()` decorator
- `PermissionsGuard` skips checks when `NODE_ENV=development` (logs warning)

## Linting

- ESLint 9 flat config with TypeScript and Prettier
- Run: `pnpm --filter backend lint`
- TypeScript: `pnpm --filter backend exec tsc --noEmit`

## Swagger

- Available at `/api/docs` in development
- All endpoints documented with `@ApiOperation`, `@ApiResponse`, `@ApiTags`
- Bearer auth configured globally
