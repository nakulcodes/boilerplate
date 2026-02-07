import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BasePaginatedCommand } from '@boilerplate/core';

export class ListTimelineCommand extends BasePaginatedCommand {
  @IsString()
  @IsNotEmpty()
  readonly entityType: string;

  @IsUUID()
  @IsNotEmpty()
  readonly entityId: string;

  @IsString()
  @IsOptional()
  readonly eventType?: string;
}
