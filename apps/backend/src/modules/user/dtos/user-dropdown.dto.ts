import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UserDropdownQueryDto {
  @ApiPropertyOptional({
    description:
      'Comma-separated list of fields to return (id,firstName,lastName,email,role)',
    example: 'id,firstName,lastName,email',
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({
    description:
      'Set to true to get paginated response, false/omit for all items',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  paginate?: boolean;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed). Only used when paginate=true',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page. Only used when paginate=true',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class UserDropdownRoleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class UserDropdownResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional({ type: UserDropdownRoleDto })
  role?: UserDropdownRoleDto | null;
}
