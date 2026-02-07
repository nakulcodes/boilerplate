import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class AssignApplicationCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly applicationId: string;

  @IsUUID()
  @IsNotEmpty()
  readonly assignedToId: string;
}
