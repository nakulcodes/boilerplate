"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { fetchApi } from "@/utils/api-client";
import { API_ROUTES } from "@/config/api-routes";
import { PERMISSIONS_ENUM } from "@/constants/permissions.constants";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import type { Role } from "@/types/role.type";
import { PaginatedResponse } from "@/types/pagination.type";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import { DataTable, DataTablePagination } from "@/components/common/data-table";

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { hasPermission } = usePermissions();

  const loadRoles = useCallback(async () => {
    try {
      const response = await fetchApi<PaginatedResponse<Role>>(
        API_ROUTES.ROLES.LIST,
        { method: "POST", body: JSON.stringify({ page: 1, limit: 100 }) }
      );
      console.log("API Response:", response);
      console.log("Response.data:", response?.data);
      setRoles(response?.data || []);
    } catch (err: any) {
      console.error("Error loading roles:", err);
      toast.error(err.message || "Failed to load roles");
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetchApi(API_ROUTES.ROLES.DELETE(deleteTarget.id), {
        method: "DELETE",
      });
      toast.success("Role deleted");
      loadRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.permissions.length} permission
            {row.original.permissions.length !== 1 ? "s" : ""}
          </span>
        ),
      },
      {
        accessorKey: "isDefault",
        header: "Type",
        size: 80,
        enableHiding: true,
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge variant="secondary">Default</Badge>
          ) : null,
      },
      {
        id: "actions",
        header: "",
        size: 48,
        enableHiding: false,
        cell: ({ row }) =>
          hasPermission(PERMISSIONS_ENUM.ROLE_UPDATE) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/roles/${row.original.id}/edit`}>
                    Edit
                  </Link>
                </DropdownMenuItem>
                {!row.original.isDefault && (
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(row.original)}
                    className="text-destructive"
                  >
                    Delete
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
    data: roles,
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
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Manage roles and their permissions
          </p>
        </div>
        {hasPermission(PERMISSIONS_ENUM.ROLE_CREATE) && (
          <Link href="/dashboard/roles/new">
            <Button>Create Role</Button>
          </Link>
        )}
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyMessage="No roles found"
      />

      <DataTablePagination table={table} totalItems={roles.length} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;
              {deleteTarget?.name}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function RolesPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.ROLE_LIST_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view roles
        </div>
      }
    >
      <RolesContent />
    </PermissionGuard>
  );
}
