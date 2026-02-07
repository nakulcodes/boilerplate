import { Injectable, ConflictException } from '@nestjs/common';
import { CandidateRepository } from '@db/repositories';
import { CandidateEntity } from '@db/entities';
import { CandidateSource } from '@db/enums';
import { CreateCandidateCommand } from './create-candidate.command';

@Injectable()
export class CreateCandidate {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(command: CreateCandidateCommand): Promise<CandidateEntity> {
    const existingCandidate = await this.candidateRepository.findByEmailAndOrg(
      command.email.toLowerCase(),
      command.organizationId,
    );

    if (existingCandidate) {
      throw new ConflictException('A candidate with this email already exists');
    }

    const candidate = this.candidateRepository.create({
      organizationId: command.organizationId,
      addedById: command.userId,
      email: command.email.toLowerCase(),
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone ?? null,
      linkedinUrl: command.linkedinUrl ?? null,
      portfolioUrl: command.portfolioUrl ?? null,
      currentCompany: command.currentCompany ?? null,
      currentTitle: command.currentTitle ?? null,
      source: command.source ?? CandidateSource.DIRECT_APPLY,
      notes: command.notes ?? null,
      customFields: command.customFields ?? null,
    });

    return this.candidateRepository.save(candidate);
  }
}
