import { IsString, IsNotEmpty } from 'class-validator';
import { BaseCommand } from '@boilerplate/core';

export class HandleOAuthCallbackCommand extends BaseCommand {
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  readonly state: string;
}
