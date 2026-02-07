import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListPaginationDto } from '@shared/dtos/list-pagination.dto';
import { CandidateSource } from '@db/enums';

export class ListCandidatesDto extends ListPaginationDto {
  @ApiPropertyOptional({
    description: 'Search in name and email',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by candidate source',
    enum: CandidateSource,
  })
  @IsEnum(CandidateSource)
  @IsOptional()
  source?: CandidateSource;
}
