import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateEntity } from '../entities/candidate.entity';

@Injectable()
export class CandidateRepository extends Repository<CandidateEntity> {
  constructor(
    @InjectRepository(CandidateEntity)
    private readonly repository: Repository<CandidateEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findById(id: string): Promise<CandidateEntity | null> {
    return this.findOne({ where: { id } });
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<CandidateEntity | null> {
    return this.findOne({ where: { id, organizationId } });
  }

  async findByEmailAndOrg(
    email: string,
    organizationId: string,
  ): Promise<CandidateEntity | null> {
    return this.findOne({ where: { email, organizationId } });
  }
}
