"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchApi } from "@/utils/api-client";
import { API_ROUTES } from "@/config/api-routes";
import { PERMISSIONS_ENUM } from "@/constants/permissions.constants";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { PaginatedResponse } from "@/types/pagination.type";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import { DataTable, DataTablePagination } from "@/components/common/data-table";

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
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  invited: "secondary",
  blocked: "destructive",
  inactive: "outline",
};

function UsersContent() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { hasPermission } = usePermissions();

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetchApi<PaginatedResponse<UserListItem>>(
        API_ROUTES.USERS.LIST,
        { method: "POST", body: JSON.stringify({ page: 1, limit: 50 }) }
      );
      console.log("API Response:", response);
      console.log("Response.data:", response?.data);
      setUsers(response?.data || []);
    } catch (err: any) {
      console.error("Error loading users:", err);
      toast.error(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlock = async (userId: string) => {
    try {
      await fetchApi(API_ROUTES.USERS.BLOCK(userId), {
        method: "POST",
      });
      toast.success("User blocked");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to block user");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await fetchApi(API_ROUTES.USERS.UNBLOCK(userId), {
        method: "POST",
      });
      toast.success("User unblocked");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to unblock user");
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await fetchApi(API_ROUTES.USERS.RESEND_INVITE, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      toast.success("Invite resent");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend invite");
    }
  };

  const getDisplayName = (user: UserListItem) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: "email",
        header: "User",
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
        accessorKey: "status",
        header: "Status",
        enableHiding: true,
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status] || "outline"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.role?.name || "No role"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 48,
        enableHiding: false,
        cell: ({ row }) =>
          hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) ||
          hasPermission(PERMISSIONS_ENUM.USER_CREATE) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {row.original.status === "invited" &&
                  hasPermission(PERMISSIONS_ENUM.USER_CREATE) && (
                    <DropdownMenuItem
                      onClick={() => handleResendInvite(row.original.id)}
                    >
                      Resend Invite
                    </DropdownMenuItem>
                  )}
                {row.original.status === "active" &&
                  hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) && (
                    <DropdownMenuItem
                      onClick={() => handleBlock(row.original.id)}
                      className="text-destructive"
                    >
                      Block
                    </DropdownMenuItem>
                  )}
                {row.original.status === "blocked" &&
                  hasPermission(PERMISSIONS_ENUM.USER_UPDATE_STATUS) && (
                    <DropdownMenuItem
                      onClick={() => handleUnblock(row.original.id)}
                    >
                      Unblock
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null,
      },
    ],
    [hasPermission]
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

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      <DataTablePagination table={table} totalItems={users.length} />
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
