import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '@shared/decorators/user-session.decorator';
import { RequirePermissions } from '@shared/decorators/require-permissions.decorator';
import { ApiOkPaginatedResponse } from '@shared/decorators/api-ok-paginated-response.decorator';
import { PaginatedResponseDto } from '@shared/dtos/pagination-response';
import { AttachmentResponseDto } from './dtos/attachment-response.dto';
import { ListAttachmentsDto } from './dtos/list-attachments.dto';
import { CreateAttachmentDto } from './dtos/create-attachment.dto';
import { ListAttachments } from './usecases/list-attachments/list-attachments.usecase';
import { ListAttachmentsCommand } from './usecases/list-attachments/list-attachments.command';
import { CreateAttachment } from './usecases/create-attachment/create-attachment.usecase';
import { CreateAttachmentCommand } from './usecases/create-attachment/create-attachment.command';
import { DeleteAttachment } from './usecases/delete-attachment/delete-attachment.usecase';
import { DeleteAttachmentCommand } from './usecases/delete-attachment/delete-attachment.command';

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentController {
  constructor(
    private readonly listAttachments: ListAttachments,
    private readonly createAttachment: CreateAttachment,
    private readonly deleteAttachment: DeleteAttachment,
  ) {}

  @Post('list')
  @RequirePermissions(PERMISSIONS_ENUM.ATTACHMENT_READ)
  @ApiOperation({ summary: 'List attachments for an entity' })
  @ApiOkPaginatedResponse(AttachmentResponseDto)
  async list(
    @UserSession() user: UserSessionData,
    @Body() dto: ListAttachmentsDto,
  ): Promise<PaginatedResponseDto<AttachmentResponseDto>> {
    return this.listAttachments.execute(
      ListAttachmentsCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: dto.page,
        limit: dto.limit,
        entityType: dto.entityType,
        entityId: dto.entityId,
        category: dto.category,
      }),
    ) as any;
  }

  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.ATTACHMENT_CREATE)
  @ApiOperation({ summary: 'Create an attachment record' })
  @ApiResponse({ status: 201, type: AttachmentResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateAttachmentDto,
  ): Promise<AttachmentResponseDto> {
    return this.createAttachment.execute(
      CreateAttachmentCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        category: dto.category,
      }),
    ) as any;
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS_ENUM.ATTACHMENT_DELETE)
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiResponse({ status: 200 })
  async delete(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<void> {
    return this.deleteAttachment.execute(
      DeleteAttachmentCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        attachmentId: id,
      }),
    );
  }
}
