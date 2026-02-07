import { Injectable, NotFoundException } from '@nestjs/common';
import { CandidateRepository } from '@db/repositories';
import { CandidateEntity } from '@db/entities';
import { GetCandidateCommand } from './get-candidate.command';

@Injectable()
export class GetCandidate {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(command: GetCandidateCommand): Promise<CandidateEntity> {
    const candidate = await this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoin('candidate.addedBy', 'addedBy')
      .where('candidate.id = :id', { id: command.candidateId })
      .andWhere('candidate.organizationId = :organizationId', {
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
      ])
      .getOne();

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }
}
