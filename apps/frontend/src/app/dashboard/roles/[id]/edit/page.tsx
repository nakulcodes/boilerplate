"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchApi } from "@/utils/api-client";
import { buildApiUrl, API_ROUTES } from "@/config/api-routes";
import { PERMISSIONS_ENUM } from "@/constants/permissions.constants";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionPicker } from "@/components/roles/permission-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import type { Role } from "@/types/role.type";

function EditRoleContent() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRole = useCallback(async () => {
    try {
      const data = await fetchApi<Role>(
        buildApiUrl(API_ROUTES.ROLES.GET(roleId))
      );
      setRole(data);
      setName(data.name);
      setPermissions([...data.permissions]);
    } catch (err: any) {
      toast.error(err.message || "Failed to load role");
      router.push("/dashboard/roles");
    } finally {
      setIsLoading(false);
    }
  }, [roleId, router]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await fetchApi(buildApiUrl(API_ROUTES.ROLES.UPDATE(roleId)), {
        method: "PUT",
        body: JSON.stringify({ name, permissions }),
      });
      toast.success("Role updated");
      router.push("/dashboard/roles");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Role</h1>
          <p className="text-sm text-muted-foreground">
            Update role name and permissions
          </p>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="role-name">Role Name</Label>
          <Input
            id="role-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Editor, Viewer, Manager"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-3">
          <div>
            <Label>Permissions</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Select which actions this role can perform
            </p>
          </div>
          <PermissionPicker
            selected={permissions}
            onChange={setPermissions}
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving || !name.trim()}>
            {isSaving ? "Saving..." : "Update Role"}
          </Button>
          <Link href="/dashboard/roles">
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function EditRolePage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.ROLE_UPDATE}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to edit roles
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
        <EditRoleContent />
      </Suspense>
    </PermissionGuard>
  );
}
