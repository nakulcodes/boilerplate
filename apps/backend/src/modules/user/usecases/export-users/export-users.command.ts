import { IsIn, IsOptional, IsString } from 'class-validator';
import { BaseAuthenticatedCommand } from '@boilerplate/core';
import type { ExportFormat } from '@boilerplate/core';

export class ExportUsersCommand extends BaseAuthenticatedCommand {
  @IsIn(['csv', 'xlsx'])
  readonly format!: ExportFormat;

  @IsOptional()
  @IsString()
  readonly status?: string;

  @IsOptional()
  @IsString()
  readonly search?: string;
}
