import { useSession } from "@/contexts/session-context";
import { Permission } from "@/types/permissions.type";
import { DEFAULT_ROLES } from "@/constants/role.constants";

export function usePermissions() {
  const { user } = useSession();

  const isAdmin =
    user?.role === DEFAULT_ROLES.EMPIRE_ADMIN ||
    user?.role === DEFAULT_ROLES.PARTNER_ADMIN;

  const hasPermission = (requiredPermission: Permission): boolean => {
    // Admin check first - most permissive
    if (isAdmin) {
      return true;
    }

    // Check if user has permissions array
    if (!user?.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    return user.permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    // Admin check first - most permissive
    if (isAdmin) {
      return true;
    }

    // Check if user has permissions array
    if (!user?.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    return requiredPermissions.some((permission) =>
      user.permissions.includes(permission)
    );
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    // Admin check first - most permissive
    if (isAdmin) {
      return true;
    }

    // Check if user has permissions array
    if (!user?.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    return requiredPermissions.every((permission) =>
      user.permissions.includes(permission)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  };
}
