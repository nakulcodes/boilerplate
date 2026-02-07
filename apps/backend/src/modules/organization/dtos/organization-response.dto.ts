import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  domain: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl?: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
