import { useSession } from "@/contexts/session-context";
import { Permission } from "@/types/permissions.type";

export function usePermissions() {
  const { user } = useSession();

  const hasPermission = (requiredPermission: Permission): boolean => {
    if (!user?.permissions?.length) return false;
    return user.permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (!user?.permissions?.length) return false;
    return requiredPermissions.some((p) => user.permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    if (!user?.permissions?.length) return false;
    return requiredPermissions.every((p) => user.permissions.includes(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
