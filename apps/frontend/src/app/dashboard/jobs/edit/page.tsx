'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Skeleton } from '@/components/ui/skeleton';
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
import type { Job } from '@/types/job.type';

function EditJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  const loadJob = useCallback(async () => {
    if (!jobId) {
      toast.error('Job ID is required');
      router.push('/dashboard/jobs');
      return;
    }
    try {
      const data = await fetchApi<Job>(API_ROUTES.JOBS.GET(jobId));
      reset({
        title: data.title,
        description: data.description || '',
        requirements: data.requirements || '',
        department: data.department || '',
        location: data.location || '',
        locationType: data.locationType as 'onsite' | 'remote' | 'hybrid',
        type: data.type as
          | 'full_time'
          | 'part_time'
          | 'contract'
          | 'internship',
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryCurrency: data.salaryCurrency || 'USD',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load job';
      toast.error(message);
      router.push('/dashboard/jobs');
    } finally {
      setIsLoading(false);
    }
  }, [jobId, router, reset]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const onSubmit = async (formData: JobFormData) => {
    if (!jobId) return;
    try {
      await fetchApi(API_ROUTES.JOBS.UPDATE(jobId), {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      toast.success('Job updated');
      router.push('/dashboard/jobs');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update job';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-medium">Edit Job</h2>
          <p className="text-sm text-muted-foreground">Update job details</p>
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
            {isSubmitting ? 'Saving...' : 'Update Job'}
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

export default function EditJobPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.JOB_UPDATE}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to edit jobs
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="max-w-4xl space-y-6">
            <Skeleton className="h-8 w-48" />
          </div>
        }
      >
        <EditJobContent />
      </Suspense>
    </PermissionGuard>
  );
}
