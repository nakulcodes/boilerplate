import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BasePaginatedCommand } from '@boilerplate/core';

export class ListCommentsCommand extends BasePaginatedCommand {
  @IsString()
  @IsNotEmpty()
  readonly entityType: string;

  @IsUUID()
  @IsNotEmpty()
  readonly entityId: string;

  @IsBoolean()
  @IsOptional()
  readonly includeInternal?: boolean;
}
