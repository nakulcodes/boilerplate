import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { BasePaginatedCommand } from '@boilerplate/core';
import { UserStatus } from '../../../../database/enums';

export class ListUsersCommand extends BasePaginatedCommand {
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  invitedBy?: string;

  // page and limit inherited from BasePaginatedCommand
  // userId and organizationId inherited from BaseAuthenticatedCommand
}
