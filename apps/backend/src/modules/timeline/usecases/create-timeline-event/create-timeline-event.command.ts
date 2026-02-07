import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class CreateTimelineEventCommand extends OrganizationCommand {
  @IsString()
  @IsNotEmpty()
  readonly entityType: string;

  @IsUUID()
  @IsNotEmpty()
  readonly entityId: string;

  @IsString()
  @IsNotEmpty()
  readonly eventType: string;

  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsOptional()
  readonly metadata?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  readonly isPublic?: boolean;
}
