import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CommentAuthorDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  email: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  isInternal: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: CommentAuthorDto })
  author?: CommentAuthorDto;
}
