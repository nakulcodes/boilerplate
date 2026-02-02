import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordResetBodyDto {
  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'reset-token-uuid' })
  @IsNotEmpty()
  @IsString()
  token!: string;
}

export class PasswordResetRequestBodyDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
