import { Injectable, NotFoundException } from '@nestjs/common';
import { AttachmentRepository } from '@db/repositories';
import { DeleteAttachmentCommand } from './delete-attachment.command';

@Injectable()
export class DeleteAttachment {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  async execute(command: DeleteAttachmentCommand): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: {
        id: command.attachmentId,
        organizationId: command.organizationId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.attachmentRepository.remove(attachment);
  }
}
