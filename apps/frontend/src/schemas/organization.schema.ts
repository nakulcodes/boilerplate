import { z } from 'zod/v4';

export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200).trim(),
  domain: z.string().min(1, 'Domain is required').max(100).trim(),
  logoUrl: z.string().url().max(500).nullable().optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
