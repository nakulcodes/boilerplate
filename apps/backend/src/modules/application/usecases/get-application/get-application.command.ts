import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class GetApplicationCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly applicationId: string;
}
