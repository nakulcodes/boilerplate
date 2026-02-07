export enum PERMISSIONS_ENUM {
  USER_CREATE = 'user:create',
  USER_LIST_READ_OWN = 'user:list:read:own',
  USER_LIST_READ_TEAM = 'user:list:read:team',
  USER_LIST_READ_ALL = 'user:list:read:all',
  USER_READ_OWN = 'user:read:own',
  USER_READ_TEAM = 'user:read:team',
  USER_READ_ALL = 'user:read:all',
  USER_UPDATE_OWN = 'user:update:own',
  USER_UPDATE_TEAM = 'user:update:team',
  USER_UPDATE_ALL = 'user:update:all',
  USER_UPDATE_STATUS = 'user:update-status',
  USER_IMPERSONATE = 'user:impersonate',

  ROLE_CREATE = 'role:create',
  ROLE_UPDATE_STATUS = 'role:update-status',
  ROLE_READ = 'role:read',
  ROLE_LIST_READ = 'role:list:read',
  ROLE_UPDATE = 'role:update',

  ORGANIZATION_READ = 'organization:read',
  ORGANIZATION_UPDATE = 'organization:update',
  ORGANIZATION_SETTINGS = 'organization:settings',

  AUDIT_LIST_READ = 'audit:list:read',
  AUDIT_READ = 'audit:read',

  INTEGRATION_LIST_READ = 'integration:list:read',
  INTEGRATION_CONNECT = 'integration:connect',
  INTEGRATION_DISCONNECT = 'integration:disconnect',

  // Timeline
  TIMELINE_READ = 'timeline:read',

  // Comments
  COMMENT_CREATE = 'comment:create',
  COMMENT_READ = 'comment:read',
  COMMENT_DELETE = 'comment:delete',

  // Attachments
  ATTACHMENT_CREATE = 'attachment:create',
  ATTACHMENT_READ = 'attachment:read',
  ATTACHMENT_DELETE = 'attachment:delete',

  // Jobs
  JOB_CREATE = 'job:create',
  JOB_READ = 'job:read',
  JOB_UPDATE = 'job:update',
  JOB_DELETE = 'job:delete',
  JOB_PUBLISH = 'job:publish',

  // Candidates
  CANDIDATE_CREATE = 'candidate:create',
  CANDIDATE_READ = 'candidate:read',
  CANDIDATE_UPDATE = 'candidate:update',

  // Applications
  APPLICATION_READ = 'application:read',
  APPLICATION_UPDATE_STATUS = 'application:update:status',
  APPLICATION_ASSIGN = 'application:assign',

  // Interviews
  INTERVIEW_CREATE = 'interview:create',
  INTERVIEW_READ = 'interview:read',
  INTERVIEW_UPDATE = 'interview:update',
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS_ENUM);

export type PermissionScope = 'own' | 'team' | 'all';

export function getPermissionScope(
  permissions: string[],
  basePermission: string,
): PermissionScope | null {
  if (
    permissions.includes(`${basePermission}:all`) ||
    permissions.includes(basePermission)
  ) {
    return 'all';
  }
  if (permissions.includes(`${basePermission}:team`)) {
    return 'team';
  }
  if (permissions.includes(`${basePermission}:own`)) {
    return 'own';
  }
  return null;
}

export const PERMISSION_GROUPS: Record<
  string,
  { label: string; permissions: PERMISSIONS_ENUM[] }
> = {
  users: {
    label: 'Users',
    permissions: [
      PERMISSIONS_ENUM.USER_CREATE,
      PERMISSIONS_ENUM.USER_LIST_READ_OWN,
      PERMISSIONS_ENUM.USER_LIST_READ_TEAM,
      PERMISSIONS_ENUM.USER_LIST_READ_ALL,
      PERMISSIONS_ENUM.USER_READ_OWN,
      PERMISSIONS_ENUM.USER_READ_TEAM,
      PERMISSIONS_ENUM.USER_READ_ALL,
      PERMISSIONS_ENUM.USER_UPDATE_OWN,
      PERMISSIONS_ENUM.USER_UPDATE_TEAM,
      PERMISSIONS_ENUM.USER_UPDATE_ALL,
      PERMISSIONS_ENUM.USER_UPDATE_STATUS,
      PERMISSIONS_ENUM.USER_IMPERSONATE,
    ],
  },
  roles: {
    label: 'Roles',
    permissions: [
      PERMISSIONS_ENUM.ROLE_CREATE,
      PERMISSIONS_ENUM.ROLE_LIST_READ,
      PERMISSIONS_ENUM.ROLE_READ,
      PERMISSIONS_ENUM.ROLE_UPDATE,
      PERMISSIONS_ENUM.ROLE_UPDATE_STATUS,
    ],
  },
  organization: {
    label: 'Organization',
    permissions: [
      PERMISSIONS_ENUM.ORGANIZATION_READ,
      PERMISSIONS_ENUM.ORGANIZATION_UPDATE,
      PERMISSIONS_ENUM.ORGANIZATION_SETTINGS,
    ],
  },
  audit: {
    label: 'Audit Logs',
    permissions: [
      PERMISSIONS_ENUM.AUDIT_LIST_READ,
      PERMISSIONS_ENUM.AUDIT_READ,
    ],
  },
  integrations: {
    label: 'Integrations',
    permissions: [
      PERMISSIONS_ENUM.INTEGRATION_LIST_READ,
      PERMISSIONS_ENUM.INTEGRATION_CONNECT,
      PERMISSIONS_ENUM.INTEGRATION_DISCONNECT,
    ],
  },
  timeline: {
    label: 'Timeline',
    permissions: [PERMISSIONS_ENUM.TIMELINE_READ],
  },
  comments: {
    label: 'Comments',
    permissions: [
      PERMISSIONS_ENUM.COMMENT_CREATE,
      PERMISSIONS_ENUM.COMMENT_READ,
      PERMISSIONS_ENUM.COMMENT_DELETE,
    ],
  },
  attachments: {
    label: 'Attachments',
    permissions: [
      PERMISSIONS_ENUM.ATTACHMENT_CREATE,
      PERMISSIONS_ENUM.ATTACHMENT_READ,
      PERMISSIONS_ENUM.ATTACHMENT_DELETE,
    ],
  },
  jobs: {
    label: 'Jobs',
    permissions: [
      PERMISSIONS_ENUM.JOB_CREATE,
      PERMISSIONS_ENUM.JOB_READ,
      PERMISSIONS_ENUM.JOB_UPDATE,
      PERMISSIONS_ENUM.JOB_DELETE,
      PERMISSIONS_ENUM.JOB_PUBLISH,
    ],
  },
  candidates: {
    label: 'Candidates',
    permissions: [
      PERMISSIONS_ENUM.CANDIDATE_CREATE,
      PERMISSIONS_ENUM.CANDIDATE_READ,
      PERMISSIONS_ENUM.CANDIDATE_UPDATE,
    ],
  },
  applications: {
    label: 'Applications',
    permissions: [
      PERMISSIONS_ENUM.APPLICATION_READ,
      PERMISSIONS_ENUM.APPLICATION_UPDATE_STATUS,
      PERMISSIONS_ENUM.APPLICATION_ASSIGN,
    ],
  },
  interviews: {
    label: 'Interviews',
    permissions: [
      PERMISSIONS_ENUM.INTERVIEW_CREATE,
      PERMISSIONS_ENUM.INTERVIEW_READ,
      PERMISSIONS_ENUM.INTERVIEW_UPDATE,
    ],
  },
};
