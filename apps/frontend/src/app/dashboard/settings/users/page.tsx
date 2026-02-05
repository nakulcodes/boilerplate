'use client';

import { useState, useCallback, useMemo } from 'react';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { usePermissions } from '@/hooks/use-permissions';
import { useSession } from '@/contexts/session-context';
import { useImpersonation } from '@/hooks/use-impersonation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
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
import {
  useUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useResendInviteMutation,
  User,
  UserStatus,
} from '@/generated/graphql';

type UserListItem = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'status' | 'isActive' | 'role'
>;

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  INVITED: 'secondary',
  BLOCKED: 'destructive',
  INACTIVE: 'outline',
};

function UsersContent() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useSession();
  const { startImpersonation } = useImpersonation();

  const { data, loading, refetch } = useUsersQuery({
    variables: { input: { page: 1, limit: 50 } },
  });

  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [resendInvite] = useResendInviteMutation();

  const users = data?.users?.data || [];

  const handleBlock = useCallback(
    async (userId: string) => {
      try {
        await blockUser({ variables: { id: userId } });
        toast.success('User blocked');
        refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to block user';
        toast.error(message);
      }
    },
    [blockUser, refetch],
  );

  const handleUnblock = useCallback(
    async (userId: string) => {
      try {
        await unblockUser({ variables: { id: userId } });
        toast.success('User unblocked');
        refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to unblock user';
        toast.error(message);
      }
    },
    [unblockUser, refetch],
  );

  const handleResendInvite = useCallback(
    async (userId: string) => {
      try {
        await resendInvite({ variables: { userId } });
        toast.success('Invite resent');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to resend invite';
        toast.error(message);
      }
    },
    [resendInvite],
  );

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
            {row.original.status.toLowerCase()}
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
            hasPermission('user:update') ||
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
                {hasPermission('user:update') && (
                  <DropdownMenuItem onClick={() => setEditTarget(user)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {user.status === UserStatus.Invited &&
                  hasPermission(PERMISSIONS_ENUM.USER_CREATE) && (
                    <DropdownMenuItem
                      onClick={() => handleResendInvite(user.id)}
                    >
                      Resend Invite
                    </DropdownMenuItem>
                  )}
                {user.status === UserStatus.Active &&
                  user.id !== currentUser?.userId &&
                  hasPermission(PERMISSIONS_ENUM.USER_IMPERSONATE) && (
                    <DropdownMenuItem
                      onClick={() => startImpersonation(user.id)}
                    >
                      Impersonate
                    </DropdownMenuItem>
                  )}
                {user.status === UserStatus.Active &&
                  hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) && (
                    <DropdownMenuItem
                      onClick={() => handleBlock(user.id)}
                      className="text-destructive"
                    >
                      Block
                    </DropdownMenuItem>
                  )}
                {user.status === UserStatus.Blocked &&
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
    data: users as UserListItem[],
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

  if (loading) {
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
          <Button onClick={() => setCreateOpen(true)}>Create User</Button>
        )}
      </div>

      <DataTable
        table={table}
        isLoading={loading}
        emptyMessage="No users found"
      />

      <DataTablePagination table={table} totalItems={users.length} />

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => refetch()}
      />

      <EditUserDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSuccess={() => refetch()}
        user={
          editTarget
            ? {
                id: editTarget.id,
                email: editTarget.email,
                firstName: editTarget.firstName,
                lastName: editTarget.lastName,
                roleId: editTarget.role?.id || null,
              }
            : null
        }
      />
    </div>
  );
}

export default function SettingsUsersPage() {
  return (
    <PermissionGuard
      permissions="user:list:read"
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
