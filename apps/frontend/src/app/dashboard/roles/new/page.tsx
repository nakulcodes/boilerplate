'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PermissionPicker } from '@/components/roles/permission-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

function CreateRoleContent() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await fetchApi(API_ROUTES.ROLES.CREATE, {
        method: 'POST',
        body: JSON.stringify({ name, permissions }),
      });
      toast.success('Role created');
      router.push('/dashboard/roles');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Role</h1>
          <p className="text-sm text-muted-foreground">
            Define a new role with specific permissions
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Creating...' : 'Create Role'}
          </Button>
          <Link href="/dashboard/roles">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CreateRolePage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.ROLE_CREATE}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to create roles
        </div>
      }
    >
      <CreateRoleContent />
    </PermissionGuard>
  );
}
