import { Injectable, NotFoundException } from '@nestjs/common';
import { JobRepository } from '@db/repositories';
import { JobEntity } from '@db/entities';
import { GetJobCommand } from './get-job.command';

@Injectable()
export class GetJob {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(command: GetJobCommand): Promise<JobEntity> {
    const job = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.createdBy', 'createdBy')
      .where('job.id = :id', { id: command.jobId })
      .andWhere('job.organizationId = :organizationId', {
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
      ])
      .getOne();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }
}
