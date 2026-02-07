import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BasePaginatedCommand } from '@boilerplate/core';
import { ApplicationStatus } from '@db/enums';

export class ListApplicationsCommand extends BasePaginatedCommand {
  @IsUUID()
  @IsOptional()
  readonly jobId?: string;

  @IsUUID()
  @IsOptional()
  readonly candidateId?: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  readonly status?: ApplicationStatus;

  @IsUUID()
  @IsOptional()
  readonly assignedToId?: string;
}
