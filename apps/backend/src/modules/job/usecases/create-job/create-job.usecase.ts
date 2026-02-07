import { Injectable } from '@nestjs/common';
import { JobRepository } from '@db/repositories';
import { JobEntity } from '@db/entities';
import { JobStatus, JobType, JobLocationType } from '@db/enums';
import { CreateJobCommand } from './create-job.command';

@Injectable()
export class CreateJob {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(command: CreateJobCommand): Promise<JobEntity> {
    const slug = await this.generateUniqueSlug(
      command.title,
      command.organizationId,
    );

    const job = this.jobRepository.create({
      organizationId: command.organizationId,
      createdById: command.userId,
      title: command.title,
      slug,
      description: command.description ?? null,
      requirements: command.requirements ?? null,
      department: command.department ?? null,
      location: command.location ?? null,
      locationType: command.locationType ?? JobLocationType.ONSITE,
      type: command.type ?? JobType.FULL_TIME,
      status: JobStatus.DRAFT,
      salaryMin: command.salaryMin ?? null,
      salaryMax: command.salaryMax ?? null,
      salaryCurrency: command.salaryCurrency ?? null,
      customFields: command.customFields ?? null,
      publishedAt: null,
      closedAt: null,
    });

    return this.jobRepository.save(job);
  }

  private async generateUniqueSlug(
    title: string,
    organizationId: string,
  ): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.jobRepository.slugExists(slug, organizationId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}
