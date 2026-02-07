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
import { CommentResponseDto } from './dtos/comment-response.dto';
import { ListCommentsDto } from './dtos/list-comments.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { ListComments } from './usecases/list-comments/list-comments.usecase';
import { ListCommentsCommand } from './usecases/list-comments/list-comments.command';
import { CreateComment } from './usecases/create-comment/create-comment.usecase';
import { CreateCommentCommand } from './usecases/create-comment/create-comment.command';
import { DeleteComment } from './usecases/delete-comment/delete-comment.usecase';
import { DeleteCommentCommand } from './usecases/delete-comment/delete-comment.command';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly listComments: ListComments,
    private readonly createComment: CreateComment,
    private readonly deleteComment: DeleteComment,
  ) {}

  @Post('list')
  @RequirePermissions(PERMISSIONS_ENUM.COMMENT_READ)
  @ApiOperation({ summary: 'List comments for an entity' })
  @ApiOkPaginatedResponse(CommentResponseDto)
  async list(
    @UserSession() user: UserSessionData,
    @Body() dto: ListCommentsDto,
  ): Promise<PaginatedResponseDto<CommentResponseDto>> {
    return this.listComments.execute(
      ListCommentsCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: dto.page,
        limit: dto.limit,
        entityType: dto.entityType,
        entityId: dto.entityId,
        includeInternal: dto.includeInternal,
      }),
    ) as any;
  }

  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.COMMENT_CREATE)
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.createComment.execute(
      CreateCommentCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        content: dto.content,
        parentId: dto.parentId,
        isInternal: dto.isInternal,
      }),
    ) as any;
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS_ENUM.COMMENT_DELETE)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200 })
  async delete(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<void> {
    return this.deleteComment.execute(
      DeleteCommentCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        commentId: id,
      }),
    );
  }
}
