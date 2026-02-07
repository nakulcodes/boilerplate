import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class JobCreatorDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  email: string;
}

export class JobResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  requirements?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  locationType: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  salaryMax?: number;

  @ApiPropertyOptional()
  salaryCurrency?: string;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  closedAt?: Date;

  @ApiPropertyOptional()
  customFields?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: JobCreatorDto })
  createdBy?: JobCreatorDto;
}
