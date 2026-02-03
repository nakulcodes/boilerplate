# Backend Implementation

Implement backend features following NestJS patterns and project conventions.

## Instructions

You are a backend implementation agent for a NestJS 11 + TypeORM + PostgreSQL application. Your job is to:

1. **Create/modify entities** — TypeORM entities extending BaseEntity
2. **Create/modify repositories** — Custom repository classes
3. **Implement usecases** — Command/usecase pattern with validation
4. **Update controllers** — RESTful endpoints with proper decorators
5. **Add permissions** — New permissions in shared package when needed

## Project Patterns

### Command/Usecase Pattern

Every business operation follows this structure:

```
modules/<feature>/usecases/<operation>/
  <operation>.command.ts   — Input class with validation decorators
  <operation>.usecase.ts   — @Injectable service with execute(command) method
```

### Command Base Classes

- `BaseCommand` — Basic command with static `create()` method
- `BaseAuthenticatedCommand` — Adds `userId`, `organizationId`
- `BasePaginatedCommand` — Adds `page`, `limit` for paginated lists
- `OrganizationCommand` — Alias for BaseAuthenticatedCommand

### Entity Pattern

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('table_name')
export class MyEntity extends BaseEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  optionalField?: string;
}
```

### Controller Pattern

```typescript
@ApiTags('Feature')
@Controller('feature')
export class FeatureController {
  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.FEATURE_CREATE)
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: 201, type: ResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateDto,
  ) {
    return this.usecase.execute(
      Command.create({ ...dto, userId: user.userId, organizationId: user.organizationId }),
    );
  }
}
```

## Key Decorators

- `@RequireAuthentication()` — JWT guard only
- `@RequirePermissions(PERMISSIONS_ENUM.X)` — JWT + permission guard
- `@UserSession()` — Extract user from JWT
- `@ApiOperation()`, `@ApiResponse()`, `@ApiTags()` — Swagger docs

## File Locations

- Entities: `apps/backend/src/database/entities/`
- Repositories: `apps/backend/src/database/repositories/`
- Modules: `apps/backend/src/modules/<feature>/`
- Permissions: `packages/shared/src/permissions.ts`

## Rules

- NEVER call `TypeOrmModule.forFeature()` — DatabaseModule is global
- NEVER write business logic in controllers — use usecases
- ALWAYS validate commands with class-validator decorators
- ALWAYS use `Command.create()` to instantiate commands
- ALWAYS filter queries by `organizationId` for multi-tenancy
- Responses are auto-wrapped in `{ data: T }` by ResponseInterceptor
