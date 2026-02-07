import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class PublishJobCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly jobId: string;
}
