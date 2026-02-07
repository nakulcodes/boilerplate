import { Injectable, NotFoundException } from '@nestjs/common';
import { JobRepository } from '@db/repositories';
import { JobEntity } from '@db/entities';
import { UpdateJobCommand } from './update-job.command';

@Injectable()
export class UpdateJob {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(command: UpdateJobCommand): Promise<JobEntity> {
    const job = await this.jobRepository.findByIdAndOrg(
      command.jobId,
      command.organizationId,
    );

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (command.title !== undefined) {
      job.title = command.title;
      job.slug = await this.generateUniqueSlug(
        command.title,
        command.organizationId,
        job.id,
      );
    }

    if (command.description !== undefined) {
      job.description = command.description;
    }

    if (command.requirements !== undefined) {
      job.requirements = command.requirements;
    }

    if (command.department !== undefined) {
      job.department = command.department;
    }

    if (command.location !== undefined) {
      job.location = command.location;
    }

    if (command.locationType !== undefined) {
      job.locationType = command.locationType;
    }

    if (command.type !== undefined) {
      job.type = command.type;
    }

    if (command.salaryMin !== undefined) {
      job.salaryMin = command.salaryMin;
    }

    if (command.salaryMax !== undefined) {
      job.salaryMax = command.salaryMax;
    }

    if (command.salaryCurrency !== undefined) {
      job.salaryCurrency = command.salaryCurrency;
    }

    if (command.customFields !== undefined) {
      job.customFields = { ...job.customFields, ...command.customFields };
    }

    return this.jobRepository.save(job);
  }

  private async generateUniqueSlug(
    title: string,
    organizationId: string,
    excludeId: string,
  ): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.jobRepository.findBySlugAndOrg(
        slug,
        organizationId,
      );
      if (!existing || existing.id === excludeId) {
        break;
      }
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
