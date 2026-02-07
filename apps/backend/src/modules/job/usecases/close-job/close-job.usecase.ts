import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JobRepository } from '@db/repositories';
import { JobEntity } from '@db/entities';
import { JobStatus } from '@db/enums';
import { CloseJobCommand } from './close-job.command';

@Injectable()
export class CloseJob {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(command: CloseJobCommand): Promise<JobEntity> {
    const job = await this.jobRepository.findByIdAndOrg(
      command.jobId,
      command.organizationId,
    );

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Only published jobs can be closed');
    }

    job.status = JobStatus.CLOSED;
    job.closedAt = new Date();

    return this.jobRepository.save(job);
  }
}
