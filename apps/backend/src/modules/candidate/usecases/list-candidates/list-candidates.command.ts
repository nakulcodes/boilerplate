import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginatedCommand } from '@boilerplate/core';
import { CandidateSource } from '@db/enums';

export class ListCandidatesCommand extends BasePaginatedCommand {
  @IsString()
  @IsOptional()
  readonly search?: string;

  @IsEnum(CandidateSource)
  @IsOptional()
  readonly source?: CandidateSource;
}
