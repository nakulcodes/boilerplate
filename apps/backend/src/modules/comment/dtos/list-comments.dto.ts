import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListPaginationDto } from '@shared/dtos/list-pagination.dto';

export class ListCommentsDto extends ListPaginationDto {
  @ApiProperty({
    description: 'Entity type to filter by',
    example: 'application',
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: 'Entity ID to filter by',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Include internal comments',
    default: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  includeInternal?: boolean;
}
