import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { SetMetadata, UseGuards } from '@nestjs/common';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import { ListAuditLogs } from '../../modules/audit/usecases/list-audit-logs/list-audit-logs.usecase';
import { ListAuditLogsCommand } from '../../modules/audit/usecases/list-audit-logs/list-audit-logs.command';
import { GetAuditLog } from '../../modules/audit/usecases/get-audit-log/get-audit-log.usecase';
import type { UserSessionData } from '../../modules/shared/decorators/user-session.decorator';
import { PERMISSIONS_KEY } from '../../modules/shared/decorators/require-permissions.decorator';

import { GqlAuthGuard, GqlPermissionsGuard } from '../guards';
import { CurrentUser } from '../decorators';
import { AuditLog, PaginatedAuditLogList } from '../types';
import type { ListAuditLogsInput } from '../inputs';
import { ListAuditLogsInput as ListAuditLogsInputClass } from '../inputs';

@Resolver(() => AuditLog)
export class AuditResolver {
  constructor(
    private readonly listAuditLogsUsecase: ListAuditLogs,
    private readonly getAuditLogUsecase: GetAuditLog,
  ) {}

  @Query(() => PaginatedAuditLogList)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.AUDIT_LIST_READ])
  async auditLogs(
    @CurrentUser() user: UserSessionData,
    @Args('input', { nullable: true, type: () => ListAuditLogsInputClass })
    input?: ListAuditLogsInput,
  ): Promise<PaginatedAuditLogList> {
    const result = await this.listAuditLogsUsecase.execute(
      ListAuditLogsCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: input?.page ?? 1,
        limit: input?.limit ?? 10,
        actorId: input?.actorId,
        action: input?.action,
        method: input?.method,
        startDate: input?.startDate,
        endDate: input?.endDate,
      }),
    );
    return result as unknown as PaginatedAuditLogList;
  }

  @Query(() => AuditLog)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.AUDIT_READ])
  async auditLog(
    @CurrentUser() user: UserSessionData,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AuditLog> {
    const result = await this.getAuditLogUsecase.execute(
      id,
      user.organizationId,
    );
    return result as unknown as AuditLog;
  }
}
