'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/utils/api-client';
import { buildApiUrl, API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

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
  const { hasPermission } = usePermissions();

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchApi<{ data: UserListItem[] }>(
        buildApiUrl(API_ROUTES.USERS.LIST),
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

  const handleBlock = async (userId: string) => {
    try {
      await fetchApi(buildApiUrl(API_ROUTES.USERS.BLOCK(userId)), {
        method: 'POST',
      });
      toast.success('User blocked');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to block user');
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await fetchApi(buildApiUrl(API_ROUTES.USERS.UNBLOCK(userId)), {
        method: 'POST',
      });
      toast.success('User unblocked');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unblock user');
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await fetchApi(buildApiUrl(API_ROUTES.USERS.RESEND_INVITE), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      toast.success('Invite resent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend invite');
    }
  };

  const getDisplayName = (user: UserListItem) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
        </div>
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
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar
                        name={getDisplayName(user)}
                        className="h-8 w-8 text-xs"
                      />
                      <div>
                        <div className="font-medium">
                          {getDisplayName(user)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[user.status] || 'outline'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.role?.name || 'No role'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) ||
                      hasPermission(PERMISSIONS_ENUM.USER_CREATE)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'invited' &&
                            hasPermission(PERMISSIONS_ENUM.USER_CREATE) && (
                              <DropdownMenuItem
                                onClick={() => handleResendInvite(user.id)}
                              >
                                Resend Invite
                              </DropdownMenuItem>
                            )}
                          {user.status === 'active' &&
                            hasPermission(
                              PERMISSIONS_ENUM.USER_UPDATE_STATUS,
                            ) && (
                              <DropdownMenuItem
                                onClick={() => handleBlock(user.id)}
                                className="text-destructive"
                              >
                                Block
                              </DropdownMenuItem>
                            )}
                          {user.status === 'blocked' &&
                            hasPermission(
                              PERMISSIONS_ENUM.USER_UPDATE_STATUS,
                            ) && (
                              <DropdownMenuItem
                                onClick={() => handleUnblock(user.id)}
                              >
                                Unblock
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function UsersPage() {
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
