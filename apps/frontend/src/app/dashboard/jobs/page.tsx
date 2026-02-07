'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { JobStatusBadge } from '@/components/jobs/job-status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table';
import { DataTable, DataTablePagination } from '@/components/common/data-table';
import { Job, JobStatus } from '@/types/job.type';

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};

const locationTypeLabels: Record<string, string> = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { hasPermission } = usePermissions();

  const canPublish = hasPermission(PERMISSIONS_ENUM.JOB_PUBLISH);
  const canUpdate = hasPermission(PERMISSIONS_ENUM.JOB_UPDATE);

  const loadJobs = useCallback(async () => {
    try {
      const data = await fetchApi<{ data: Job[] }>(API_ROUTES.JOBS.LIST, {
        method: 'POST',
        body: JSON.stringify({ page: 1, limit: 50 }),
      });
      setJobs(data?.data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load jobs';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handlePublish = useCallback(
    async (jobId: string) => {
      try {
        await fetchApi(API_ROUTES.JOBS.PUBLISH(jobId), { method: 'POST' });
        toast.success('Job published');
        loadJobs();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to publish job';
        toast.error(message);
      }
    },
    [loadJobs],
  );

  const handleClose = useCallback(
    async (jobId: string) => {
      try {
        await fetchApi(API_ROUTES.JOBS.CLOSE(jobId), { method: 'POST' });
        toast.success('Job closed');
        loadJobs();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to close job';
        toast.error(message);
      }
    },
    [loadJobs],
  );

  const columns = useMemo<ColumnDef<Job>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.department || '-'}</span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.location || '-'}</span>
        ),
      },
      {
        accessorKey: 'locationType',
        header: 'Work Type',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">
            {locationTypeLabels[row.original.locationType] ||
              row.original.locationType}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Job Type',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">
            {jobTypeLabels[row.original.type] || row.original.type}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableHiding: true,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <JobStatusBadge
              status={job.status as JobStatus}
              interactive={true}
              canPublish={canPublish}
              canClose={canUpdate}
              onPublish={() => handlePublish(job.id)}
              onClose={() => handleClose(job.id)}
            />
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 48,
        enableHiding: false,
        cell: ({ row }) => {
          const job = row.original;
          if (!canUpdate) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/edit?id=${job.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/pipeline?id=${job.id}`}>
                    View Pipeline
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canPublish, canUpdate, handlePublish, handleClose],
  );

  const table = useReactTable({
    data: jobs,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Manage job postings and openings
          </p>
        </div>
        {hasPermission(PERMISSIONS_ENUM.JOB_CREATE) && (
          <Link href="/dashboard/jobs/new">
            <Button>Create Job</Button>
          </Link>
        )}
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyMessage="No jobs found"
      />

      <DataTablePagination table={table} totalItems={jobs.length} />
    </div>
  );
}

export default function JobsPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.JOB_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view jobs
        </div>
      }
    >
      <JobsContent />
    </PermissionGuard>
  );
}
