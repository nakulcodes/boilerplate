'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { JobStatus } from '@/types/job.type';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface JobStatusBadgeProps {
  status: JobStatus;
  interactive?: boolean;
  onStatusChange?: (newStatus: JobStatus) => void;
  onPublish?: () => void;
  onClose?: () => void;
  canPublish?: boolean;
  canClose?: boolean;
}

const statusConfig: Record<
  JobStatus,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  [JobStatus.DRAFT]: {
    label: 'Draft',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
  [JobStatus.PUBLISHED]: {
    label: 'Published',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  [JobStatus.CLOSED]: {
    label: 'Closed',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  [JobStatus.ARCHIVED]: {
    label: 'Archived',
    bgColor: 'bg-violet-50 dark:bg-violet-950',
    textColor: 'text-violet-700 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
};

const allStatuses: JobStatus[] = [
  JobStatus.DRAFT,
  JobStatus.PUBLISHED,
  JobStatus.CLOSED,
  JobStatus.ARCHIVED,
];

function StatusPill({
  status,
  showChevron = false,
  className,
}: {
  status: JobStatus;
  showChevron?: boolean;
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className,
      )}
    >
      {config.label}
      {showChevron && <ChevronUpDownIcon className="h-4 w-4 opacity-60" />}
    </span>
  );
}

export function JobStatusBadge({
  status,
  interactive = false,
  onPublish,
  onClose,
  canPublish = false,
  canClose = false,
}: JobStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[JobStatus.DRAFT];

  if (!interactive || (!canPublish && !canClose)) {
    return <StatusPill status={status} />;
  }

  const handleStatusSelect = (newStatus: JobStatus) => {
    if (newStatus === status) return;

    if (
      newStatus === JobStatus.PUBLISHED &&
      status === JobStatus.DRAFT &&
      onPublish
    ) {
      onPublish();
    } else if (
      newStatus === JobStatus.CLOSED &&
      status === JobStatus.PUBLISHED &&
      onClose
    ) {
      onClose();
    }
  };

  const getAvailableTransitions = (): JobStatus[] => {
    switch (status) {
      case JobStatus.DRAFT:
        return canPublish
          ? [JobStatus.DRAFT, JobStatus.PUBLISHED]
          : [JobStatus.DRAFT];
      case JobStatus.PUBLISHED:
        return canClose
          ? [JobStatus.DRAFT, JobStatus.PUBLISHED, JobStatus.CLOSED]
          : [JobStatus.DRAFT, JobStatus.PUBLISHED];
      case JobStatus.CLOSED:
        return [
          JobStatus.DRAFT,
          JobStatus.PUBLISHED,
          JobStatus.CLOSED,
          JobStatus.ARCHIVED,
        ];
      case JobStatus.ARCHIVED:
        return [
          JobStatus.DRAFT,
          JobStatus.PUBLISHED,
          JobStatus.CLOSED,
          JobStatus.ARCHIVED,
        ];
      default:
        return allStatuses;
    }
  };

  const availableStatuses = getAvailableTransitions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 rounded-full">
          <StatusPill
            status={status}
            showChevron
            className="cursor-pointer hover:opacity-90"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px] p-1">
        {availableStatuses.map((s) => {
          const sConfig = statusConfig[s];
          const isSelected = s === status;
          const isDisabled =
            (s === JobStatus.PUBLISHED && status !== JobStatus.DRAFT) ||
            (s === JobStatus.CLOSED && status !== JobStatus.PUBLISHED);

          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusSelect(s)}
              disabled={isDisabled && !isSelected}
              className={cn(
                'flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                isSelected && 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium',
                  sConfig.bgColor,
                  sConfig.textColor,
                )}
              >
                {sConfig.label}
              </span>
              {isSelected && <CheckIcon className="h-4 w-4 text-foreground" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
