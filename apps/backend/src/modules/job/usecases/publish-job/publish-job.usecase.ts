import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JobRepository } from '@db/repositories';
import { JobEntity } from '@db/entities';
import { JobStatus } from '@db/enums';
import { PublishJobCommand } from './publish-job.command';

@Injectable()
export class PublishJob {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(command: PublishJobCommand): Promise<JobEntity> {
    const job = await this.jobRepository.findByIdAndOrg(
      command.jobId,
      command.organizationId,
    );

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only draft jobs can be published');
    }

    job.status = JobStatus.PUBLISHED;
    job.publishedAt = new Date();

    return this.jobRepository.save(job);
  }
}
