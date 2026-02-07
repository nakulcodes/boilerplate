'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuditLogs, type AuditLogWithActor } from '@/utils/supabase-queries';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { DataTable, DataTablePagination } from '@/components/common/data-table';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const methodColors: Record<string, string> = {
  POST: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PUT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PATCH:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors: Record<string, string> = {
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface AuditLogActor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

function getActorName(actor?: AuditLogActor | null): string {
  if (!actor) return 'System';
  if (actor.firstName || actor.lastName) {
    return `${actor.firstName || ''} ${actor.lastName || ''}`.trim();
  }
  return actor.email;
}

function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLogWithActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogWithActor | null>(
    null,
  );

  const [actionFilter, setActionFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [appliedFilters, setAppliedFilters] = useState<{
    action: string;
    method: string;
  }>({ action: '', method: 'all' });

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAuditLogs({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        action: appliedFilters.action || undefined,
        method:
          appliedFilters.method !== 'all' ? appliedFilters.method : undefined,
      });

      setLogs(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load audit logs';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, appliedFilters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = () => {
    setAppliedFilters({ action: actionFilter, method: methodFilter });
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setActionFilter('');
    setMethodFilter('all');
    setAppliedFilters({ action: '', method: 'all' });
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo<ColumnDef<AuditLogWithActor>[]>(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium font-mono text-sm">
              {row.original.action}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.path}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Method',
        size: 80,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${methodColors[row.original.method] || ''}`}
          >
            {row.original.method}
          </span>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{getActorName(row.original.actor)}</span>
            {row.original.actor?.email && (
              <span className="text-xs text-muted-foreground">
                {row.original.actor.email}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'statusCode',
        header: 'Status',
        size: 80,
        cell: ({ row }) => {
          const isSuccess =
            row.original.statusCode >= 200 && row.original.statusCode < 300;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isSuccess ? statusColors.success : statusColors.error}`}
            >
              {row.original.statusCode}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Time',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.createdAt), {
              addSuffix: true,
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedLog(row.original)}
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const hasFilters =
    appliedFilters.action ||
    (appliedFilters.method && appliedFilters.method !== 'all');

  if (isLoading && logs.length === 0) {
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
      <div>
        <h2 className="text-lg font-medium">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">
          Track all actions performed in your organization
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter by action (e.g. users.invite)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>
        {hasFilters && (
          <Button onClick={clearFilters} variant="ghost" size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyMessage="No audit logs found"
        onRowClick={(row) => setSelectedLog(row)}
      />

      <DataTablePagination table={table} totalItems={total} />

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open: boolean) => !open && setSelectedLog(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Action</span>
                  <p className="font-mono font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Method</span>
                  <p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${methodColors[selectedLog.method] || ''}`}
                    >
                      {selectedLog.method}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p>
                    <Badge
                      variant={
                        selectedLog.statusCode >= 200 &&
                        selectedLog.statusCode < 300
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {selectedLog.statusCode}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p>
                    {selectedLog.duration ? `${selectedLog.duration}ms` : '-'}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Path</span>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {selectedLog.path}
                </p>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Actor</span>
                <p className="mt-1">
                  {getActorName(selectedLog.actor)}
                  {selectedLog.actor?.email && (
                    <span className="text-muted-foreground ml-2">
                      ({selectedLog.actor.email})
                    </span>
                  )}
                </p>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <p className="font-mono">{selectedLog.ipAddress || '-'}</p>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Time</span>
                <p>{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>

              {selectedLog.metadata && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Metadata</span>
                  <pre className="mt-1 bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="text-sm">
                  <span className="text-muted-foreground">User Agent</span>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.AUDIT_LIST_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view audit logs
        </div>
      }
    >
      <AuditLogsContent />
    </PermissionGuard>
  );
}
