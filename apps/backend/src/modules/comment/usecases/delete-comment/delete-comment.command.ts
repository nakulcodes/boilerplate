import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class DeleteCommentCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly commentId: string;
}
