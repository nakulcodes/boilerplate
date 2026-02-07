import { JobStatus, JobType, JobLocationType } from '@boilerplate/shared';

export { JobStatus, JobType, JobLocationType };

export interface JobCreator {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface Job {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description?: string;
  requirements?: string;
  department?: string;
  location?: string;
  locationType: JobLocationType;
  type: JobType;
  status: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  publishedAt?: string;
  closedAt?: string;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: JobCreator;
}

export interface JobListItem extends Job {}

export interface JobDropdown {
  id: string;
  title: string;
  status: JobStatus;
}
