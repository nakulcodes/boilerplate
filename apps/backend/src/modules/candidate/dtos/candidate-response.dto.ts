import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CandidateAddedByDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  email: string;
}

export class CandidateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  portfolioUrl?: string;

  @ApiPropertyOptional()
  currentCompany?: string;

  @ApiPropertyOptional()
  currentTitle?: string;

  @ApiProperty()
  source: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  customFields?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: CandidateAddedByDto })
  addedBy?: CandidateAddedByDto;
}
