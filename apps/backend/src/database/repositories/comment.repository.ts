import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findById(id: string): Promise<CommentEntity | null> {
    return this.findOne({ where: { id }, relations: ['author'] });
  }

  async findByEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
  ): Promise<CommentEntity[]> {
    return this.find({
      where: { organizationId, entityType, entityId },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
  }
}
