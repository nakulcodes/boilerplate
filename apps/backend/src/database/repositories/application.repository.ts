import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../entities/application.entity';

@Injectable()
export class ApplicationRepository extends Repository<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly repository: Repository<ApplicationEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findById(id: string): Promise<ApplicationEntity | null> {
    return this.findOne({ where: { id } });
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<ApplicationEntity | null> {
    return this.findOne({ where: { id, organizationId } });
  }

  async findByJobAndCandidate(
    jobId: string,
    candidateId: string,
  ): Promise<ApplicationEntity | null> {
    return this.findOne({ where: { jobId, candidateId } });
  }

  async existsByJobAndCandidate(
    jobId: string,
    candidateId: string,
  ): Promise<boolean> {
    const count = await this.count({ where: { jobId, candidateId } });
    return count > 0;
  }
}
