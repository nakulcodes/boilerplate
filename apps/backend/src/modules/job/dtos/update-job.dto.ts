import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { JobType, JobLocationType } from '@db/enums';

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: 'Job title',
    example: 'Senior Software Engineer',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Job description',
    example:
      'We are looking for a senior software engineer to join our team...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job requirements',
    example: '5+ years of experience with TypeScript...',
  })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Department',
    example: 'Engineering',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'San Francisco, CA',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    description: 'Location type',
    enum: JobLocationType,
  })
  @IsEnum(JobLocationType)
  @IsOptional()
  locationType?: JobLocationType;

  @ApiPropertyOptional({
    description: 'Job type',
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsOptional()
  type?: JobType;

  @ApiPropertyOptional({
    description: 'Minimum salary',
    example: 100000,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary',
    example: 150000,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({
    description: 'Salary currency',
    example: 'USD',
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  salaryCurrency?: string;

  @ApiPropertyOptional({
    description: 'Custom fields for organization-specific data',
    example: { costCenter: 'ENG-001' },
  })
  @IsOptional()
  customFields?: Record<string, unknown>;
}
