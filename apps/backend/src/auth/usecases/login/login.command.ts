import { BaseCommand } from '@boilerplate/core';
import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginCommand extends BaseCommand {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsDefined()
  @IsString()
  password!: string;
}
