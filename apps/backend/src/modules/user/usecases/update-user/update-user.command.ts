import { BaseAuthenticatedCommand } from '@boilerplate/core';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserCommand extends BaseAuthenticatedCommand {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;
}
