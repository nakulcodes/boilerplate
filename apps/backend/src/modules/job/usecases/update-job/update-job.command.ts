import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';
import { JobType, JobLocationType } from '@db/enums';

export class UpdateJobCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly jobId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly title?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly requirements?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly location?: string;

  @IsEnum(JobLocationType)
  @IsOptional()
  readonly locationType?: JobLocationType;

  @IsEnum(JobType)
  @IsOptional()
  readonly type?: JobType;

  @IsInt()
  @Min(0)
  @IsOptional()
  readonly salaryMin?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  readonly salaryMax?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  readonly salaryCurrency?: string;

  @IsOptional()
  readonly customFields?: Record<string, unknown>;
}
