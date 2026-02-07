import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../shared/transformers/trim';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Inc.' })
  @IsString()
  @IsOptional()
  @Trim()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'acme.com' })
  @IsString()
  @IsOptional()
  @Trim()
  @MaxLength(100)
  domain?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/logos/acme.png',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Invalid logo URL' })
  @MaxLength(500)
  logoUrl?: string | null;
}
