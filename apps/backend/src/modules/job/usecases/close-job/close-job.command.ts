import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class CloseJobCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly jobId: string;
}
