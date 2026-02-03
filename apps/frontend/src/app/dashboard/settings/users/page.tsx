'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { usePermissions } from '@/hooks/use-permissions';
import { useSession } from '@/contexts/session-context';
import { useImpersonation } from '@/hooks/use-impersonation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { InviteUserDialog } from '@/components/users/invite-user-dialog';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table';
import { DataTable, DataTablePagination } from '@/components/common/data-table';

interface UserListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  isActive: boolean;
  organizationId: string;
  roleId: string | null;
  role: { id: string; name: string } | null;
  createdAt: string;
  invitedBy: string | null;
  inviter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  invited: 'secondary',
  blocked: 'destructive',
  inactive: 'outline',
};

function UsersContent() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useSession();
  const { startImpersonation } = useImpersonation();

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchApi<{ data: UserListItem[] }>(
        API_ROUTES.USERS.LIST,
        { method: 'POST', body: JSON.stringify({ page: 1, limit: 50 }) },
      );
      setUsers(data?.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlock = useCallback(
    async (userId: string) => {
      try {
        await fetchApi(API_ROUTES.USERS.BLOCK(userId), {
          method: 'POST',
        });
        toast.success('User blocked');
        loadUsers();
      } catch (err: any) {
        toast.error(err.message || 'Failed to block user');
      }
    },
    [loadUsers],
  );

  const handleUnblock = useCallback(
    async (userId: string) => {
      try {
        await fetchApi(API_ROUTES.USERS.UNBLOCK(userId), {
          method: 'POST',
        });
        toast.success('User unblocked');
        loadUsers();
      } catch (err: any) {
        toast.error(err.message || 'Failed to unblock user');
      }
    },
    [loadUsers],
  );

  const handleResendInvite = useCallback(async (userId: string) => {
    try {
      await fetchApi(API_ROUTES.USERS.RESEND_INVITE, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      toast.success('Invite resent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend invite');
    }
  }, []);

  const getDisplayName = (user: UserListItem) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'User',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <InitialsAvatar
              name={getDisplayName(row.original)}
              className="h-8 w-8 text-xs"
            />
            <div>
              <div className="font-medium">{getDisplayName(row.original)}</div>
              <div className="text-sm text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableHiding: true,
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status] || 'outline'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.role?.name || 'No role'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 48,
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;
          const showActions =
            hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) ||
            hasPermission(PERMISSIONS_ENUM.USER_CREATE) ||
            hasPermission(PERMISSIONS_ENUM.USER_UPDATE) ||
            hasPermission(PERMISSIONS_ENUM.USER_IMPERSONATE);

          if (!showActions) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasPermission(PERMISSIONS_ENUM.USER_UPDATE) && (
                  <DropdownMenuItem onClick={() => setEditTarget(user)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {user.status === 'invited' &&
                  hasPermission(PERMISSIONS_ENUM.USER_CREATE) && (
                    <DropdownMenuItem
                      onClick={() => handleResendInvite(user.id)}
                    >
                      Resend Invite
                    </DropdownMenuItem>
                  )}
                {user.status === 'active' &&
                  user.id !== currentUser?.userId &&
                  hasPermission(PERMISSIONS_ENUM.USER_IMPERSONATE) && (
                    <DropdownMenuItem
                      onClick={() => startImpersonation(user.id)}
                    >
                      Impersonate
                    </DropdownMenuItem>
                  )}
                {user.status === 'active' &&
                  hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) && (
                    <DropdownMenuItem
                      onClick={() => handleBlock(user.id)}
                      className="text-destructive"
                    >
                      Block
                    </DropdownMenuItem>
                  )}
                {user.status === 'blocked' &&
                  hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) && (
                    <DropdownMenuItem onClick={() => handleUnblock(user.id)}>
                      Unblock
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      hasPermission,
      handleBlock,
      handleUnblock,
      handleResendInvite,
      currentUser?.userId,
      startImpersonation,
    ],
  );

  const table = useReactTable({
    data: users,
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
          <h2 className="text-lg font-medium">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        {hasPermission(PERMISSIONS_ENUM.USER_CREATE) && (
          <Button onClick={() => setInviteOpen(true)}>Invite User</Button>
        )}
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      <DataTablePagination table={table} totalItems={users.length} />

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={loadUsers}
      />

      <EditUserDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSuccess={loadUsers}
        user={editTarget}
      />
    </div>
  );
}

export default function SettingsUsersPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.USER_LIST_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view users
        </div>
      }
    >
      <UsersContent />
    </PermissionGuard>
  );
}
