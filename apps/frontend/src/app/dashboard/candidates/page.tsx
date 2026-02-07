'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/common/data-table';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import { Candidate, CandidateSource } from '@/types/candidate.type';
import {
  CandidateSourceBadge,
  CreateCandidateDialog,
  EditCandidateDialog,
  CandidateSlideOut,
} from '@/components/candidates';

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: CandidateSource.DIRECT_APPLY, label: 'Direct Apply' },
  { value: CandidateSource.REFERRAL, label: 'Referral' },
  { value: CandidateSource.LINKEDIN, label: 'LinkedIn' },
  { value: CandidateSource.AGENCY, label: 'Agency' },
  { value: CandidateSource.OTHER, label: 'Other' },
];

function CandidatesContent() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(PERMISSIONS_ENUM.CANDIDATE_CREATE);
  const canUpdate = hasPermission(PERMISSIONS_ENUM.CANDIDATE_UPDATE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const loadCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const body: Record<string, unknown> = { page: 1, limit: 50 };
      if (debouncedSearch) {
        body.search = debouncedSearch;
      }
      if (sourceFilter && sourceFilter !== 'all') {
        body.source = sourceFilter;
      }

      const data = await fetchApi<{ data: Candidate[] }>(
        API_ROUTES.CANDIDATES.LIST,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      );
      setCandidates(data?.data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load candidates';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, sourceFilter]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleRowClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailDialogOpen(true);
  };

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEditDialogOpen(true);
  };

  const handleEditFromDetail = () => {
    setDetailDialogOpen(false);
    setEditDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableHiding: false,
        cell: ({ row }) => {
          const candidate = row.original;
          const fullName = `${candidate.firstName} ${candidate.lastName}`;
          return (
            <div className="flex items-center gap-3">
              <InitialsAvatar name={fullName} className="h-8 w-8 text-sm" />
              <span className="font-medium">{fullName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        enableHiding: true,
        cell: ({ row }) => (
          <CandidateSourceBadge source={row.original.source} />
        ),
      },
      {
        accessorKey: 'currentCompany',
        header: 'Company',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.currentCompany || '-'}</span>
        ),
      },
      {
        accessorKey: 'currentTitle',
        header: 'Title',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.currentTitle || '-'}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Added',
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
          const candidate = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(candidate);
                  }}
                >
                  View
                </DropdownMenuItem>
                {canUpdate && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(candidate);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canUpdate],
  );

  const table = useReactTable({
    data: candidates,
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

  if (isLoading && candidates.length === 0) {
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
          <h2 className="text-lg font-medium">Candidates</h2>
          <p className="text-sm text-muted-foreground">
            Manage your candidate database
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            Add Candidate
          </Button>
        )}
      </div>

      <DataTableToolbar
        table={table}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by name or email..."
        filters={
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyMessage="No candidates found"
        onRowClick={handleRowClick}
      />

      <DataTablePagination table={table} totalItems={candidates.length} />

      <CreateCandidateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadCandidates}
      />

      <EditCandidateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadCandidates}
        candidate={selectedCandidate}
      />

      <CandidateSlideOut
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        candidate={selectedCandidate}
        onEdit={handleEditFromDetail}
        canEdit={canUpdate}
      />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.CANDIDATE_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view candidates
        </div>
      }
    >
      <CandidatesContent />
    </PermissionGuard>
  );
}
