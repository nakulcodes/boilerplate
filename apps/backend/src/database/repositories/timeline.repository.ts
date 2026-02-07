import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimelineEntity } from '../entities/timeline.entity';

@Injectable()
export class TimelineRepository extends Repository<TimelineEntity> {
  constructor(
    @InjectRepository(TimelineEntity)
    private readonly repository: Repository<TimelineEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findById(id: string): Promise<TimelineEntity | null> {
    return this.findOne({ where: { id } });
  }

  async findByEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
  ): Promise<TimelineEntity[]> {
    return this.find({
      where: { organizationId, entityType, entityId },
      order: { createdAt: 'DESC' },
      relations: ['actor'],
    });
  }
}
