import { ApiProperty } from '@nestjs/swagger';

// Inline DTOs for auth responses to avoid importing full DTOs with extra fields
class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty({ required: false })
  lastName?: string | null;

  @ApiProperty()
  organizationId!: string;
}

class AuthOrganizationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Access token (1 hour expiry)' })
  accessToken!: string;

  @ApiProperty({ description: 'Refresh token (30 days expiry)' })
  refreshToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthOrganizationDto })
  organization!: AuthOrganizationDto;
}

export class RegisterResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthOrganizationDto })
  organization!: AuthOrganizationDto;
}
