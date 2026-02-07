import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'Job ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({
    description: 'Candidate ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @ApiPropertyOptional({
    description: 'Custom fields for organization-specific data',
    example: { referralSource: 'employee_referral' },
  })
  @IsOptional()
  customFields?: Record<string, unknown>;
}
