import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentEntity } from '../entities/attachment.entity';

@Injectable()
export class AttachmentRepository extends Repository<AttachmentEntity> {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly repository: Repository<AttachmentEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findById(id: string): Promise<AttachmentEntity | null> {
    return this.findOne({ where: { id }, relations: ['uploadedBy'] });
  }

  async findByEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
  ): Promise<AttachmentEntity[]> {
    return this.find({
      where: { organizationId, entityType, entityId },
      order: { createdAt: 'DESC' },
      relations: ['uploadedBy'],
    });
  }
}
