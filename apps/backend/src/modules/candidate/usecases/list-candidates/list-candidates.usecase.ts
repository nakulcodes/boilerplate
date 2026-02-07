import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginationMetadata } from '@boilerplate/core';
import { CandidateRepository } from '@db/repositories';
import { ListCandidatesCommand } from './list-candidates.command';

@Injectable()
export class ListCandidates {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(command: ListCandidatesCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoin('candidate.addedBy', 'addedBy')
      .where('candidate.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .select([
        'candidate.id',
        'candidate.organizationId',
        'candidate.email',
        'candidate.firstName',
        'candidate.lastName',
        'candidate.phone',
        'candidate.linkedinUrl',
        'candidate.portfolioUrl',
        'candidate.currentCompany',
        'candidate.currentTitle',
        'candidate.source',
        'candidate.notes',
        'candidate.customFields',
        'candidate.createdAt',
        'candidate.updatedAt',
        'addedBy.id',
        'addedBy.firstName',
        'addedBy.lastName',
        'addedBy.email',
      ]);

    if (command.search) {
      queryBuilder.andWhere(
        '(LOWER(candidate.firstName) LIKE LOWER(:search) OR LOWER(candidate.lastName) LIKE LOWER(:search) OR LOWER(candidate.email) LIKE LOWER(:search))',
        { search: `%${command.search}%` },
      );
    }

    if (command.source) {
      queryBuilder.andWhere('candidate.source = :source', {
        source: command.source,
      });
    }

    queryBuilder
      .orderBy('candidate.createdAt', 'DESC')
      .skip(skip)
      .take(command.limit);

    const [candidates, total] = await queryBuilder.getManyAndCount();

    return {
      data: candidates,
      ...createPaginationMetadata(command.page, command.limit, total),
    };
  }
}
