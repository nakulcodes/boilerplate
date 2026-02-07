import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class CreateCommentCommand extends OrganizationCommand {
  @IsString()
  @IsNotEmpty()
  readonly entityType: string;

  @IsUUID()
  @IsNotEmpty()
  readonly entityId: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsUUID()
  @IsOptional()
  readonly parentId?: string;

  @IsBoolean()
  @IsOptional()
  readonly isInternal?: boolean;
}
