import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';
import { CandidateSource } from '@db/enums';

export class UpdateCandidateCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly candidateId: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  readonly phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly linkedinUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly portfolioUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly currentCompany?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly currentTitle?: string;

  @IsEnum(CandidateSource)
  @IsOptional()
  readonly source?: CandidateSource;

  @IsString()
  @IsOptional()
  readonly notes?: string;

  @IsOptional()
  readonly customFields?: Record<string, unknown>;
}
