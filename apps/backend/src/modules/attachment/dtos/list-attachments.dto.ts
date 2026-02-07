import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ListPaginationDto } from '@shared/dtos/list-pagination.dto';

export class ListAttachmentsDto extends ListPaginationDto {
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
    description: 'Filter by category',
    example: 'resume',
  })
  @IsString()
  @IsOptional()
  category?: string;
}
