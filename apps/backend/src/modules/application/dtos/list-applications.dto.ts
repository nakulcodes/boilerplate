import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ListPaginationDto } from '@shared/dtos/list-pagination.dto';
import { ApplicationStatus } from '@db/enums';

export class ListApplicationsDto extends ListPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by job ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({
    description: 'Filter by candidate ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional({
    description: 'Filter by application status',
    enum: ApplicationStatus,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Filter by assigned user ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
