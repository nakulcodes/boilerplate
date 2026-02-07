import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class CreateApplicationCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly jobId: string;

  @IsUUID()
  @IsNotEmpty()
  readonly candidateId: string;

  @IsOptional()
  readonly customFields?: Record<string, unknown>;
}
