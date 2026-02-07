import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginationMetadata } from '@boilerplate/core';
import { CommentRepository } from '@db/repositories';
import { ListCommentsCommand } from './list-comments.command';

@Injectable()
export class ListComments {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(command: ListCommentsCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.author', 'author')
      .where('comment.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .andWhere('comment.entityType = :entityType', {
        entityType: command.entityType,
      })
      .andWhere('comment.entityId = :entityId', {
        entityId: command.entityId,
      })
      .select([
        'comment.id',
        'comment.organizationId',
        'comment.authorId',
        'comment.entityType',
        'comment.entityId',
        'comment.content',
        'comment.parentId',
        'comment.isInternal',
        'comment.createdAt',
        'comment.updatedAt',
        'author.id',
        'author.firstName',
        'author.lastName',
        'author.email',
      ]);

    if (!command.includeInternal) {
      queryBuilder.andWhere('comment.isInternal = :isInternal', {
        isInternal: false,
      });
    }

    queryBuilder
      .orderBy('comment.createdAt', 'ASC')
      .skip(skip)
      .take(command.limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    return {
      data: comments,
      ...createPaginationMetadata(command.page, command.limit, total),
    };
  }
}
