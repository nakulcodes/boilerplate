import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ApplicationUserDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  email: string;
}

class ApplicationJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiProperty()
  status: string;
}

class ApplicationCandidateDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class ApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  candidateId: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiPropertyOptional()
  appliedAt?: Date;

  @ApiPropertyOptional()
  rating?: number;

  @ApiPropertyOptional()
  customFields?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: ApplicationJobDto })
  job?: ApplicationJobDto;

  @ApiPropertyOptional({ type: ApplicationCandidateDto })
  candidate?: ApplicationCandidateDto;

  @ApiPropertyOptional({ type: ApplicationUserDto })
  assignedTo?: ApplicationUserDto;
}
