import { redirect } from "next/navigation";
import { Permission } from "@/types/permissions.type";
import { cookies } from "next/headers";
import { getUserFromToken } from "./auth";
import { JWTPayload } from "@/types/user.type";
import { DEFAULT_ROLES } from "@/constants/role.constants";
import { PERMISSIONS_ENUM } from "@/constants/permissions.constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function withPermission(
  WrappedComponent: React.ComponentType<any>,
  requiredPermissions: PERMISSIONS_ENUM[],
  requireAll: boolean = false
) {
  return async function PermissionCheckedComponent(props: any) {
    // Reuse the same decoding logic from layout
    const user = getUserFromToken(
      (await cookies()).get("token")?.value || ""
    ) as JWTPayload | null;

    if (!user) {
      throw redirect("/");
    }

    if (
      user.role === DEFAULT_ROLES.EMPIRE_ADMIN ||
      user.role === DEFAULT_ROLES.PARTNER_ADMIN
    ) {
      return <WrappedComponent {...props} initialUser={user} />;
    }

    if (!user.permissions) {
      throw redirect("/dashboard");
    }

    const hasAccess = requireAll
      ? requiredPermissions.every((permission) =>
          user?.permissions?.includes(permission as Permission)
        )
      : requiredPermissions.some((permission) =>
          user?.permissions?.includes(permission as Permission)
        );

    if (!hasAccess) {
      throw redirect("/dashboard");
    }

    return <WrappedComponent {...props} initialUser={user} />;
  };
}
