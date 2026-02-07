import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginationMetadata } from '@boilerplate/core';
import { JobRepository } from '@db/repositories';
import { ListJobsCommand } from './list-jobs.command';

@Injectable()
export class ListJobs {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(command: ListJobsCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.createdBy', 'createdBy')
      .where('job.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .select([
        'job.id',
        'job.organizationId',
        'job.title',
        'job.slug',
        'job.description',
        'job.requirements',
        'job.department',
        'job.location',
        'job.locationType',
        'job.type',
        'job.status',
        'job.salaryMin',
        'job.salaryMax',
        'job.salaryCurrency',
        'job.publishedAt',
        'job.closedAt',
        'job.customFields',
        'job.createdAt',
        'job.updatedAt',
        'createdBy.id',
        'createdBy.firstName',
        'createdBy.lastName',
        'createdBy.email',
      ]);

    if (command.status) {
      queryBuilder.andWhere('job.status = :status', { status: command.status });
    }

    if (command.search) {
      queryBuilder.andWhere('LOWER(job.title) LIKE LOWER(:search)', {
        search: `%${command.search}%`,
      });
    }

    if (command.department) {
      queryBuilder.andWhere('job.department = :department', {
        department: command.department,
      });
    }

    queryBuilder
      .orderBy('job.createdAt', 'DESC')
      .skip(skip)
      .take(command.limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      data: jobs,
      ...createPaginationMetadata(command.page, command.limit, total),
    };
  }
}
