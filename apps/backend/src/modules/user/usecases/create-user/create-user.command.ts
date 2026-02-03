import { BaseCommand } from '@boilerplate/core';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserCommand extends BaseCommand {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @IsUUID()
  @IsNotEmpty()
  createdBy!: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
