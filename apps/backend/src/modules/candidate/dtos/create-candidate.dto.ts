import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CandidateSource } from '@db/enums';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'Candidate email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Candidate first name',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Candidate last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Candidate phone number',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Portfolio URL',
    example: 'https://johndoe.com',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  portfolioUrl?: string;

  @ApiPropertyOptional({
    description: 'Current company',
    example: 'Acme Inc.',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  currentCompany?: string;

  @ApiPropertyOptional({
    description: 'Current job title',
    example: 'Software Engineer',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  currentTitle?: string;

  @ApiPropertyOptional({
    description: 'Candidate source',
    enum: CandidateSource,
    default: CandidateSource.DIRECT_APPLY,
  })
  @IsEnum(CandidateSource)
  @IsOptional()
  source?: CandidateSource;

  @ApiPropertyOptional({
    description: 'Internal notes about the candidate',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Custom fields for organization-specific data',
    example: { clearanceLevel: 'secret' },
  })
  @IsOptional()
  customFields?: Record<string, unknown>;
}
