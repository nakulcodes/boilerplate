import { Injectable } from '@nestjs/common';
import { AttachmentRepository } from '@db/repositories';
import { AttachmentEntity } from '@db/entities';
import { CreateAttachmentCommand } from './create-attachment.command';

@Injectable()
export class CreateAttachment {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  async execute(command: CreateAttachmentCommand): Promise<AttachmentEntity> {
    const attachment = this.attachmentRepository.create({
      organizationId: command.organizationId,
      uploadedById: command.userId,
      entityType: command.entityType,
      entityId: command.entityId,
      fileName: command.fileName,
      fileUrl: command.fileUrl,
      mimeType: command.mimeType,
      fileSize: command.fileSize,
      category: command.category ?? null,
    });

    const saved = await this.attachmentRepository.save(attachment);
    return this.attachmentRepository.findById(
      saved.id,
    ) as Promise<AttachmentEntity>;
  }
}
