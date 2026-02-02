import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../shared/transformers/trim';

export class CreateRoleDto {
  @ApiProperty({ example: 'Editor' })
  @IsString()
  @IsNotEmpty()
  @Trim()
  name!: string;

  @ApiProperty({ type: [String], example: ['user:read', 'user:list:read'] })
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
