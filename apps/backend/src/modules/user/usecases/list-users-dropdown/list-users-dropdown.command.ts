import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';

export class ListUsersDropdownCommand extends OrganizationCommand {
  @IsArray()
  @IsString({ each: true })
  readonly fields: string[];

  @IsOptional()
  @IsBoolean()
  readonly paginate?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsString()
  readonly search?: string;

  static readonly ALLOWED_FIELDS = [
    'id',
    'firstName',
    'lastName',
    'email',
    'role',
  ];
  static readonly DEFAULT_FIELDS = ['id', 'firstName', 'lastName', 'email'];
}
