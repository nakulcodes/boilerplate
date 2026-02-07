import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginationMetadata } from '@boilerplate/core';
import { ApplicationRepository } from '@db/repositories';
import { ListApplicationsCommand } from './list-applications.command';

@Injectable()
export class ListApplications {
  constructor(private readonly applicationRepository: ApplicationRepository) {}

  async execute(command: ListApplicationsCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('application.candidate', 'candidate')
      .leftJoin('application.assignedTo', 'assignedTo')
      .where('application.organizationId = :organizationId', {
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
      ]);

    if (command.jobId) {
      queryBuilder.andWhere('application.jobId = :jobId', {
        jobId: command.jobId,
      });
    }

    if (command.candidateId) {
      queryBuilder.andWhere('application.candidateId = :candidateId', {
        candidateId: command.candidateId,
      });
    }

    if (command.status) {
      queryBuilder.andWhere('application.status = :status', {
        status: command.status,
      });
    }

    if (command.assignedToId) {
      queryBuilder.andWhere('application.assignedToId = :assignedToId', {
        assignedToId: command.assignedToId,
      });
    }

    queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(command.limit);

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      data: applications,
      ...createPaginationMetadata(command.page, command.limit, total),
    };
  }
}
