import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportUsersQueryDto {
  @ApiProperty({
    enum: ['csv', 'xlsx'],
    description: 'Export format',
  })
  @IsIn(['csv', 'xlsx'])
  format: 'csv' | 'xlsx';

  @ApiPropertyOptional({
    description: 'Filter by user status',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Search by email or name',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
