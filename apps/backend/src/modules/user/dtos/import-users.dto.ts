import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportUsersResponseDto {
  @ApiProperty({ description: 'Total rows in the file' })
  totalRows: number;

  @ApiProperty({ description: 'Rows that passed validation' })
  validRows: number;

  @ApiProperty({ description: 'Rows that failed validation' })
  invalidRows: number;

  @ApiProperty({ description: 'Number of users created' })
  createdCount: number;

  @ApiProperty({ description: 'Number of users skipped (duplicates)' })
  skippedCount: number;

  @ApiProperty({
    description: 'Validation and processing errors',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        row: { type: 'number' },
        column: { type: 'string' },
        value: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  errors: Array<{
    row: number;
    column: string;
    value: unknown;
    message: string;
  }>;
}
