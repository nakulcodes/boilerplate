import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApplicationStatus } from '@db/enums';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'New application status',
    enum: ApplicationStatus,
  })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Rejection reason (required if status is rejected)',
    example: 'Does not meet minimum qualifications',
  })
  @IsString()
  @ValidateIf((o) => o.status === ApplicationStatus.REJECTED)
  @IsNotEmpty({
    message: 'Rejection reason is required when status is rejected',
  })
  @IsOptional()
  rejectionReason?: string;
}
