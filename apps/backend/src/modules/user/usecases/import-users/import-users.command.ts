import { IsString, IsNotEmpty } from 'class-validator';
import { BaseAuthenticatedCommand } from '@boilerplate/core';

export class ImportUsersCommand extends BaseAuthenticatedCommand {
  @IsString()
  @IsNotEmpty()
  readonly path!: string;
}
