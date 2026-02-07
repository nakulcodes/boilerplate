import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CandidateRepository } from '@db/repositories';
import { CandidateEntity } from '@db/entities';
import { UpdateCandidateCommand } from './update-candidate.command';

@Injectable()
export class UpdateCandidate {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(command: UpdateCandidateCommand): Promise<CandidateEntity> {
    const candidate = await this.candidateRepository.findByIdAndOrg(
      command.candidateId,
      command.organizationId,
    );

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (command.email !== undefined) {
      const normalizedEmail = command.email.toLowerCase();
      if (normalizedEmail !== candidate.email) {
        const existingCandidate =
          await this.candidateRepository.findByEmailAndOrg(
            normalizedEmail,
            command.organizationId,
          );
        if (existingCandidate && existingCandidate.id !== candidate.id) {
          throw new ConflictException(
            'A candidate with this email already exists',
          );
        }
        candidate.email = normalizedEmail;
      }
    }

    if (command.firstName !== undefined) {
      candidate.firstName = command.firstName;
    }

    if (command.lastName !== undefined) {
      candidate.lastName = command.lastName;
    }

    if (command.phone !== undefined) {
      candidate.phone = command.phone;
    }

    if (command.linkedinUrl !== undefined) {
      candidate.linkedinUrl = command.linkedinUrl;
    }

    if (command.portfolioUrl !== undefined) {
      candidate.portfolioUrl = command.portfolioUrl;
    }

    if (command.currentCompany !== undefined) {
      candidate.currentCompany = command.currentCompany;
    }

    if (command.currentTitle !== undefined) {
      candidate.currentTitle = command.currentTitle;
    }

    if (command.source !== undefined) {
      candidate.source = command.source;
    }

    if (command.notes !== undefined) {
      candidate.notes = command.notes;
    }

    if (command.customFields !== undefined) {
      candidate.customFields = {
        ...candidate.customFields,
        ...command.customFields,
      };
    }

    return this.candidateRepository.save(candidate);
  }
}
