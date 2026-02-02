import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordBodyDto {
  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @ApiProperty({ example: 'CurrentPass123!' })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;
}
