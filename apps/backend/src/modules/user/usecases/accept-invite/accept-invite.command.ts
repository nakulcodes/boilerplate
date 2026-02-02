import { BaseCommand } from '@boilerplate/core';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptInviteCommand extends BaseCommand {
  @IsString()
  @IsNotEmpty()
  inviteToken!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
