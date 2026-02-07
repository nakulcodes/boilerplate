import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BasePaginatedCommand } from '@boilerplate/core';

export class ListAttachmentsCommand extends BasePaginatedCommand {
  @IsString()
  @IsNotEmpty()
  readonly entityType: string;

  @IsUUID()
  @IsNotEmpty()
  readonly entityId: string;

  @IsString()
  @IsOptional()
  readonly category?: string;
}
