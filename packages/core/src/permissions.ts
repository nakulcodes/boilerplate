export enum PERMISSIONS_ENUM {
  USER_CREATE = "user:create",
  USER_LIST_READ = "user:list:read",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_UPDATE_STATUS = "user:update-status",

  ROLE_CREATE = "role:create",
  ROLE_UPDATE_STATUS = "role:update-status",
  ROLE_READ = "role:read",
  ROLE_LIST_READ = "role:list:read",
  ROLE_UPDATE = "role:update",

  ORGANIZATION_READ = "organization:read",
  ORGANIZATION_UPDATE = "organization:update",
  ORGANIZATION_SETTINGS = "organization:settings",
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS_ENUM);

export const PERMISSION_GROUPS: Record<
  string,
  { label: string; permissions: PERMISSIONS_ENUM[] }
> = {
  users: {
    label: "Users",
    permissions: [
      PERMISSIONS_ENUM.USER_CREATE,
      PERMISSIONS_ENUM.USER_LIST_READ,
      PERMISSIONS_ENUM.USER_READ,
      PERMISSIONS_ENUM.USER_UPDATE,
      PERMISSIONS_ENUM.USER_UPDATE_STATUS,
    ],
  },
  roles: {
    label: "Roles",
    permissions: [
      PERMISSIONS_ENUM.ROLE_CREATE,
      PERMISSIONS_ENUM.ROLE_LIST_READ,
      PERMISSIONS_ENUM.ROLE_READ,
      PERMISSIONS_ENUM.ROLE_UPDATE,
      PERMISSIONS_ENUM.ROLE_UPDATE_STATUS,
    ],
  },
  organization: {
    label: "Organization",
    permissions: [
      PERMISSIONS_ENUM.ORGANIZATION_READ,
      PERMISSIONS_ENUM.ORGANIZATION_UPDATE,
      PERMISSIONS_ENUM.ORGANIZATION_SETTINGS,
    ],
  },
};
