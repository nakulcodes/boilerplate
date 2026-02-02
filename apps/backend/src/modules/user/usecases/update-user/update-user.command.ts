import { BaseAuthenticatedCommand } from '@boilerplate/core';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserCommand extends BaseAuthenticatedCommand {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
