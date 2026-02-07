import { z } from 'zod/v4';

export const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  description: z.string().optional(),
  requirements: z.string().optional(),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  locationType: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  type: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().max(10).optional(),
});

export type JobFormData = z.infer<typeof jobSchema>;
