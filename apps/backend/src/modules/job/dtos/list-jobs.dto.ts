import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListPaginationDto } from '@shared/dtos/list-pagination.dto';
import { JobStatus } from '@db/enums';

export class ListJobsDto extends ListPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by job status',
    enum: JobStatus,
  })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({
    description: 'Search in job title',
    example: 'engineer',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by department',
    example: 'Engineering',
  })
  @IsString()
  @IsOptional()
  department?: string;
}
