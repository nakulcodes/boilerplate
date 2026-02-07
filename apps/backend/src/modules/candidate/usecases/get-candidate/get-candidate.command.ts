import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class GetCandidateCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly candidateId: string;
}
