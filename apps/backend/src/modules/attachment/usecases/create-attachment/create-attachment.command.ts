import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class CreateAttachmentCommand extends OrganizationCommand {
  @IsString()
  @IsNotEmpty()
  readonly entityType: string;

  @IsUUID()
  @IsNotEmpty()
  readonly entityId: string;

  @IsString()
  @IsNotEmpty()
  readonly fileName: string;

  @IsString()
  @IsNotEmpty()
  readonly fileUrl: string;

  @IsString()
  @IsNotEmpty()
  readonly mimeType: string;

  @IsInt()
  @IsPositive()
  readonly fileSize: number;

  @IsString()
  @IsOptional()
  readonly category?: string;
}
