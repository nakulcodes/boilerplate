import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobEntity } from '../entities/job.entity';

@Injectable()
export class JobRepository extends Repository<JobEntity> {
  constructor(
    @InjectRepository(JobEntity)
    private readonly repository: Repository<JobEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findById(id: string): Promise<JobEntity | null> {
    return this.findOne({ where: { id } });
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<JobEntity | null> {
    return this.findOne({ where: { id, organizationId } });
  }

  async findBySlugAndOrg(
    slug: string,
    organizationId: string,
  ): Promise<JobEntity | null> {
    return this.findOne({ where: { slug, organizationId } });
  }

  async slugExists(slug: string, organizationId: string): Promise<boolean> {
    const count = await this.count({ where: { slug, organizationId } });
    return count > 0;
  }
}
