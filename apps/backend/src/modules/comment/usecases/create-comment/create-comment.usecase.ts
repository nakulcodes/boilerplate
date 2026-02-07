import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '@db/repositories';
import { CommentEntity } from '@db/entities';
import { CreateCommentCommand } from './create-comment.command';

@Injectable()
export class CreateComment {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(command: CreateCommentCommand): Promise<CommentEntity> {
    if (command.parentId) {
      const parent = await this.commentRepository.findOne({
        where: {
          id: command.parentId,
          organizationId: command.organizationId,
          entityType: command.entityType,
          entityId: command.entityId,
        },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = this.commentRepository.create({
      organizationId: command.organizationId,
      authorId: command.userId,
      entityType: command.entityType,
      entityId: command.entityId,
      content: command.content,
      parentId: command.parentId ?? null,
      isInternal: command.isInternal ?? false,
    });

    const saved = await this.commentRepository.save(comment);
    return this.commentRepository.findById(saved.id) as Promise<CommentEntity>;
  }
}
