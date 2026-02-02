import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataDto {
  @ApiProperty({
    description: 'Current page number (1-indexed)',
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of items',
  })
  total!: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
  })
  hasPreviousPage!: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Success status',
  })
  success!: boolean;

  @ApiProperty({
    description: 'List of items',
    isArray: true,
    type: Object,
  })
  payload!: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetadataDto,
  })
  metadata!: PaginationMetadataDto;
}
