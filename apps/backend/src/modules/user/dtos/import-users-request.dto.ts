import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ImportUsersRequestDto {
  @ApiProperty({
    description: 'Storage path returned from presigned URL endpoint',
    example: 'organizations/abc123/documents/1234567890-abc123.csv',
  })
  @IsString()
  @IsNotEmpty()
  path!: string;
}
