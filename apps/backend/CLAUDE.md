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
- Use `@UserSession()` to extract `{ userId, email, organizationId, permissions }` from JWT
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
- Payload: `{ userId, email, organizationId, permissions[], firstName, lastName }`
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

## API Endpoints

### Auth (`/api/v1/auth`)

- `POST /register` — public, creates user + org + default admin role
- `POST /login` — public, returns `{ accessToken, refreshToken, user, organization }`
- `POST /refresh` — RefreshJwtGuard, body: `{ refreshToken }`, returns new token pair
- `POST /logout` — authenticated, body: `{ refreshToken }`, invalidates refresh token
- `POST /update-password` — authenticated, body: `{ currentPassword, newPassword, confirmPassword }`
- `POST /reset/request` — public, body: `{ email }`, sends password reset email
- `POST /reset` — public, body: `{ password, token }`, resets password

### Users (`/api/v1/users`)

- `POST /list` — **paginated**, permission: `USER_LIST_READ`
  - Body: `{ page, limit, status?, search?, invitedBy? }`
  - Page is 0-indexed, limit default 10 (max 100)
  - Response: `{ data: User[], page, limit, total, totalPages, hasNextPage, hasPreviousPage }`
- `POST /invite` — permission: `USER_CREATE`, body: `{ email, firstName, lastName }`
- `POST /resend-invite` — permission: `USER_CREATE`, body: `{ userId }`
- `POST /accept-invite` — public, body: `{ inviteToken, firstName, lastName, password }`
- `GET /me` — authenticated, returns current user with role and org
- `PUT /profile` — authenticated, body: `{ firstName, lastName }`
- `PUT /:id` — permission: `USER_UPDATE`, body: `{ firstName, lastName }`
- `POST /:id/block` — permission: `USER_UPDATE_STATUS`
- `POST /:id/unblock` — permission: `USER_UPDATE_STATUS`

### Roles (`/api/v1/roles`)

- `GET /` — **not paginated** (returns all), permission: `ROLE_LIST_READ`
- `POST /` — permission: `ROLE_CREATE`, body: `{ name, permissions }`
- `GET /:id` — permission: `ROLE_READ`
- `PUT /:id` — permission: `ROLE_UPDATE`, body: `{ name, permissions }`
- `DELETE /:id` — permission: `ROLE_UPDATE`

### Audit (`/api/v1/audit`)

- `POST /list` — **paginated**, permission: `AUDIT_LIST_READ`
  - Body: `{ page, limit, actorId?, action?, method?, startDate?, endDate? }`
- `GET /:id` — permission: `AUDIT_READ`

### Pagination Pattern

User list uses POST with pagination. Roles return all items via GET. When adding a new paginated endpoint:

1. Create command extending `BasePaginatedCommand` (provides `page`, `limit`)
2. Create DTO extending `ListPaginationDto` (provides `page`, `limit` with validation)
3. In usecase, use `calculateSkip(page, limit)` for offset and `calculatePaginationMetadata(page, limit, total)` for response
4. Use `@ApiOkPaginatedResponse(YourDto)` on the controller method
5. Response shape: `{ data: T[], page, limit, total, totalPages, hasNextPage, hasPreviousPage }`

For simple lists that don't need pagination (like roles), just return the array directly — ResponseInterceptor wraps it in `{ data: T[] }`.

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

## Event System

The app uses `@nestjs/event-emitter` for decoupled event-driven architecture. Events are defined in `@boilerplate/shared` and emitted from usecases.

### Architecture

- **EventsModule** (`src/modules/events/`) — global module that configures event emitter and registers listeners
- **AppEventEmitter** — wrapper service for emitting typed events
- **Listeners** — handle events asynchronously (e.g., send emails)

### Emitting Events

Inject `AppEventEmitter` and emit typed events from usecases:

```typescript
import { AppEventEmitter, EventName, UserInvitedEvent } from '@boilerplate/core';

@Injectable()
export class InviteUser {
  constructor(private readonly eventEmitter: AppEventEmitter) {}

  async execute(command: InviteUserCommand) {
    // ... create user
    this.eventEmitter.emit<UserInvitedEvent>({
      eventName: EventName.USER_INVITED,
      userId: user.id,
      organizationId: command.organizationId,
      invitedBy: command.userId,
      inviteLink: inviteUrl,
      timestamp: new Date(),
    });
  }
}
```

### Event Names

Defined in `@boilerplate/shared` (`EventName` enum):

- **User events**: `USER_REGISTERED`, `USER_INVITED`, `USER_INVITE_RESENT`, `USER_INVITE_ACCEPTED`, `USER_CREATED`, `USER_BLOCKED`, `USER_UNBLOCKED`, `USER_PASSWORD_RESET_REQUESTED`, `USER_PASSWORD_RESET`, `USER_PASSWORD_UPDATED`, `USER_LOGGED_IN`, `USER_LOGGED_OUT`
- **Organization events**: `ORGANIZATION_CREATED`
- **Role events**: `ROLE_CREATED`, `ROLE_UPDATED`, `ROLE_DELETED`

### Listeners

Listeners are in `src/modules/events/listeners/`. Use `@OnEvent()` decorator:

```typescript
@Injectable()
export class UserEmailListener {
  @OnEvent(EventName.USER_INVITED, { async: true })
  async handleUserInvited(event: UserInvitedEvent): Promise<void> {
    // send invitation email
  }
}
```

Current listeners:
- **UserEmailListener** — sends invitation, welcome, and password reset emails

### Adding a New Event

1. Add event name to `EventName` enum in `packages/shared/src/events/event-names.ts`
2. Create event interface in appropriate file (`user.events.ts`, `role.events.ts`, etc.)
3. Export from `packages/shared/src/events/index.ts`
4. Emit from usecase using `AppEventEmitter.emit<YourEvent>(...)`
5. Create listener if needed in `src/modules/events/listeners/`

## Mail Module

The mail module (`src/modules/mail/`) provides email sending capabilities via `@boilerplate/core` MailService.

### Email Templates

Templates are in `@boilerplate/core` (`packages/core/src/services/mail/templates/`):
- `buildUserInviteEmail()` — invitation email with invite link
- `buildWelcomeEmail()` — welcome email after registration/invite acceptance
- `buildPasswordResetEmail()` — password reset link email

### Sending Emails

Emails are sent reactively via event listeners (see Event System above). The `UserEmailListener` handles:
- `USER_INVITED` → sends invitation email
- `USER_INVITE_RESENT` → resends invitation email
- `USER_INVITE_ACCEPTED` → sends welcome email
- `USER_REGISTERED` → sends welcome email
- `USER_PASSWORD_RESET_REQUESTED` → sends password reset email

## Audit Module

The audit module automatically logs all POST/PUT/PATCH/DELETE requests via `AuditInterceptor`. GET requests are not logged.

### How It Works

- **AuditInterceptor** (`src/modules/shared/framework/audit.interceptor.ts`) — global interceptor registered in `main.ts`
- Captures: method, path, action, actor, organization, IP, user agent, request body (sanitized), status code, duration
- Saves asynchronously (fire-and-forget) to not block responses
- Sensitive fields (password, token, etc.) are automatically redacted from metadata

### AuditLogEntity

- `organizationId` — tenant isolation
- `actorId` — user who performed the action (nullable for unauthenticated requests)
- `method` — HTTP method (POST, PUT, PATCH, DELETE)
- `path` — actual URL with IDs (e.g., `/api/v1/users/abc-123/block`)
- `action` — semantic action name (e.g., `users.block`, `roles.update`)
- `statusCode` — HTTP response status
- `metadata` — `{ params: {...}, body: {...} }` with sensitive fields redacted
- `ipAddress`, `userAgent`, `duration`

### API Endpoints (`/api/v1/audit`)

- `POST /list` — **paginated**, permission: `AUDIT_LIST_READ`
  - Body: `{ page, limit, actorId?, action?, method?, startDate?, endDate? }`
- `GET /:id` — permission: `AUDIT_READ`

### Action Naming Convention

Derived from route path:
- `POST /users/invite` → `users.invite`
- `PUT /roles/:id` → `roles.update`
- `DELETE /roles/:id` → `roles.delete`
- `POST /auth/login` → `auth.login`

## Linting

- ESLint 9 flat config with TypeScript and Prettier
- Run: `pnpm --filter backend lint`
- TypeScript: `pnpm --filter backend exec tsc --noEmit`

## Swagger

- Available at `/api/docs` in development
- All endpoints documented with `@ApiOperation`, `@ApiResponse`, `@ApiTags`
- Bearer auth configured globally
