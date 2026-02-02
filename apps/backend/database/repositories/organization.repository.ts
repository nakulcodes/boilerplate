import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';

@Injectable()
export class OrganizationRepository extends Repository<OrganizationEntity> {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repository: Repository<OrganizationEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
