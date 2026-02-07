import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AttachmentUploaderDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  email: string;
}

export class AttachmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  uploadedById: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  fileSize: number;

  @ApiPropertyOptional()
  category?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ type: AttachmentUploaderDto })
  uploadedBy?: AttachmentUploaderDto;
}
