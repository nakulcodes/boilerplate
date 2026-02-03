import { BaseAuthenticatedCommand } from '@boilerplate/core';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ImpersonateCommand extends BaseAuthenticatedCommand {
  @IsUUID()
  @IsNotEmpty()
  targetUserId!: string;
}
