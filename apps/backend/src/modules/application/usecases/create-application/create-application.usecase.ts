import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApplicationRepository,
  JobRepository,
  CandidateRepository,
} from '@db/repositories';
import { ApplicationEntity } from '@db/entities';
import { ApplicationStatus, JobStatus } from '@db/enums';
import { EventName, ApplicationCreatedEvent } from '@boilerplate/core';
import { AppEventEmitter } from '@modules/events/services/event-emitter.service';
import { CreateApplicationCommand } from './create-application.command';

@Injectable()
export class CreateApplication {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobRepository: JobRepository,
    private readonly candidateRepository: CandidateRepository,
    private readonly eventEmitter: AppEventEmitter,
  ) {}

  async execute(command: CreateApplicationCommand): Promise<ApplicationEntity> {
    const job = await this.jobRepository.findByIdAndOrg(
      command.jobId,
      command.organizationId,
    );
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot apply to a job that is not published',
      );
    }

    const candidate = await this.candidateRepository.findByIdAndOrg(
      command.candidateId,
      command.organizationId,
    );
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const existingApplication =
      await this.applicationRepository.existsByJobAndCandidate(
        command.jobId,
        command.candidateId,
      );
    if (existingApplication) {
      throw new ConflictException(
        'An application for this job and candidate already exists',
      );
    }

    const application = this.applicationRepository.create({
      organizationId: command.organizationId,
      jobId: command.jobId,
      candidateId: command.candidateId,
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date(),
      assignedToId: null,
      rejectionReason: null,
      rating: null,
      customFields: command.customFields ?? null,
    });

    const savedApplication = await this.applicationRepository.save(application);

    this.eventEmitter.emit<ApplicationCreatedEvent>({
      eventName: EventName.APPLICATION_CREATED,
      applicationId: savedApplication.id,
      organizationId: command.organizationId,
      actorId: command.userId,
      timestamp: new Date(),
    });

    return savedApplication;
  }
}
