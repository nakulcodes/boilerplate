'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema, JobFormData } from '@/schemas/job.schema';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

function CreateJobContent() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      department: '',
      location: '',
      locationType: 'onsite',
      type: 'full_time',
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: 'USD',
    },
  });

  const onSubmit = async (formData: JobFormData) => {
    try {
      await fetchApi(API_ROUTES.JOBS.CREATE, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Job created');
      router.push('/dashboard/jobs');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create job';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-medium">Create Job</h2>
          <p className="text-sm text-muted-foreground">
            Create a new job posting
          </p>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Software Engineer"
              disabled={isSubmitting}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g. Engineering"
                disabled={isSubmitting}
                {...register('department')}
              />
              {errors.department && (
                <p className="text-sm text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA"
                disabled={isSubmitting}
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Location Type</Label>
              <Controller
                name="locationType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Job Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role and responsibilities..."
              rows={6}
              disabled={isSubmitting}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the required qualifications..."
              rows={6}
              disabled={isSubmitting}
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="text-sm text-red-500">
                {errors.requirements.message}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Salary Range (Optional)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Minimum</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="e.g. 80000"
                disabled={isSubmitting}
                {...register('salaryMin', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Maximum</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="e.g. 120000"
                disabled={isSubmitting}
                {...register('salaryMax', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Input
                id="salaryCurrency"
                placeholder="e.g. USD"
                disabled={isSubmitting}
                {...register('salaryCurrency')}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Job'}
          </Button>
          <Link href="/dashboard/jobs">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.JOB_CREATE}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to create jobs
        </div>
      }
    >
      <CreateJobContent />
    </PermissionGuard>
  );
}
