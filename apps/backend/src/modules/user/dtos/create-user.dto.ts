import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    description: 'Role ID to assign to the user',
  })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    required: false,
    description:
      'Password for the user. If not provided, a random password will be generated.',
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
