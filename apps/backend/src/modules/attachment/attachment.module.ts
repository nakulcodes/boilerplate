import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { ListAttachments } from './usecases/list-attachments/list-attachments.usecase';
import { CreateAttachment } from './usecases/create-attachment/create-attachment.usecase';
import { DeleteAttachment } from './usecases/delete-attachment/delete-attachment.usecase';

const USE_CASES = [ListAttachments, CreateAttachment, DeleteAttachment];

@Module({
  controllers: [AttachmentController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class AttachmentModule {}
