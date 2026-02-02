import { useSession } from '@/contexts/session-context';
import { Permission } from '@/types/permissions.type';

export type PermissionScope = 'own' | 'team' | 'all';

export function usePermissions() {
  const { user } = useSession();

  const hasPermission = (requiredPermission: Permission | string): boolean => {
    if (!user?.permissions?.length) return false;
    return user.permissions.some(
      (p) => p === requiredPermission || p.startsWith(requiredPermission + ':'),
    );
  };

  const hasAnyPermission = (
    requiredPermissions: (Permission | string)[],
  ): boolean => {
    if (!requiredPermissions.length) return true;
    if (!user?.permissions?.length) return false;
    return requiredPermissions.some((required) =>
      user.permissions.some(
        (p) => p === required || p.startsWith(required + ':'),
      ),
    );
  };

  const hasAllPermissions = (
    requiredPermissions: (Permission | string)[],
  ): boolean => {
    if (!user?.permissions?.length) return false;
    return requiredPermissions.every((required) =>
      user.permissions.some(
        (p) => p === required || p.startsWith(required + ':'),
      ),
    );
  };

  const getScope = (basePermission: string): PermissionScope | null => {
    if (!user?.permissions?.length) return null;
    if (user.permissions.includes(`${basePermission}:all` as Permission))
      return 'all';
    if (user.permissions.includes(`${basePermission}:team` as Permission))
      return 'team';
    if (user.permissions.includes(`${basePermission}:own` as Permission))
      return 'own';
    if (user.permissions.includes(basePermission as Permission)) return 'all';
    return null;
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, getScope };
}
