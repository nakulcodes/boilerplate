import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { ListComments } from './usecases/list-comments/list-comments.usecase';
import { CreateComment } from './usecases/create-comment/create-comment.usecase';
import { DeleteComment } from './usecases/delete-comment/delete-comment.usecase';

const USE_CASES = [ListComments, CreateComment, DeleteComment];

@Module({
  controllers: [CommentController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class CommentModule {}
