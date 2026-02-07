import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginationMetadata } from '@boilerplate/core';
import { AttachmentRepository } from '@db/repositories';
import { ListAttachmentsCommand } from './list-attachments.command';

@Injectable()
export class ListAttachments {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  async execute(command: ListAttachmentsCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.attachmentRepository
      .createQueryBuilder('attachment')
      .leftJoin('attachment.uploadedBy', 'uploadedBy')
      .where('attachment.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .andWhere('attachment.entityType = :entityType', {
        entityType: command.entityType,
      })
      .andWhere('attachment.entityId = :entityId', {
        entityId: command.entityId,
      })
      .select([
        'attachment.id',
        'attachment.organizationId',
        'attachment.uploadedById',
        'attachment.entityType',
        'attachment.entityId',
        'attachment.fileName',
        'attachment.fileUrl',
        'attachment.mimeType',
        'attachment.fileSize',
        'attachment.category',
        'attachment.createdAt',
        'uploadedBy.id',
        'uploadedBy.firstName',
        'uploadedBy.lastName',
        'uploadedBy.email',
      ]);

    if (command.category) {
      queryBuilder.andWhere('attachment.category = :category', {
        category: command.category,
      });
    }

    queryBuilder
      .orderBy('attachment.createdAt', 'DESC')
      .skip(skip)
      .take(command.limit);

    const [attachments, total] = await queryBuilder.getManyAndCount();

    return {
      data: attachments,
      ...createPaginationMetadata(command.page, command.limit, total),
    };
  }
}
