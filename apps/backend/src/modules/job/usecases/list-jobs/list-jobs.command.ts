import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginatedCommand } from '@boilerplate/core';
import { JobStatus } from '@db/enums';

export class ListJobsCommand extends BasePaginatedCommand {
  @IsEnum(JobStatus)
  @IsOptional()
  readonly status?: JobStatus;

  @IsString()
  @IsOptional()
  readonly search?: string;

  @IsString()
  @IsOptional()
  readonly department?: string;
}
