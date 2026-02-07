import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationRepository } from '@db/repositories';
import { ApplicationEntity } from '@db/entities';
import { GetApplicationCommand } from './get-application.command';

@Injectable()
export class GetApplication {
  constructor(private readonly applicationRepository: ApplicationRepository) {}

  async execute(command: GetApplicationCommand): Promise<ApplicationEntity> {
    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('application.candidate', 'candidate')
      .leftJoin('application.assignedTo', 'assignedTo')
      .where('application.id = :id', { id: command.applicationId })
      .andWhere('application.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .select([
        'application.id',
        'application.organizationId',
        'application.jobId',
        'application.candidateId',
        'application.status',
        'application.assignedToId',
        'application.rejectionReason',
        'application.appliedAt',
        'application.rating',
        'application.customFields',
        'application.createdAt',
        'application.updatedAt',
        'job.id',
        'job.title',
        'job.slug',
        'job.department',
        'job.status',
        'candidate.id',
        'candidate.email',
        'candidate.firstName',
        'candidate.lastName',
        'candidate.phone',
        'assignedTo.id',
        'assignedTo.firstName',
        'assignedTo.lastName',
        'assignedTo.email',
      ])
      .getOne();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }
}
