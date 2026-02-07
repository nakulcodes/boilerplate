import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class DeleteAttachmentCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly attachmentId: string;
}
