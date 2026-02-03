import { z } from 'zod/v4';

export const inviteUserSchema = z.object({
  email: z.email('Please enter a valid email'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

export const editUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z.string().optional(),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;

export const acceptInviteSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
