import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../shared/transformers/trim';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Editor' })
  @IsString()
  @IsOptional()
  @Trim()
  name?: string;

  @ApiPropertyOptional({ type: [String], example: ['user:read', 'user:list:read'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}
