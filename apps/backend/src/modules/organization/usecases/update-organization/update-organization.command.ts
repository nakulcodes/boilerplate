import { IsOptional, IsString, MaxLength } from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class UpdateOrganizationCommand extends OrganizationCommand {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly domain?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly logoUrl?: string | null;
}
