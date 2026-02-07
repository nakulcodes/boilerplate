import { createClient } from '@/lib/supabase';
import type { Role, RoleDropdown } from '@/types/role.type';
import type { Database, Tables } from '@/types/database.types';

type DbRole = Tables<'roles'>;
type DbUser = Tables<'users'>;
type DbAuditLog = Tables<'audit_logs'>;
type DbOrganization = Tables<'organizations'>;

type RoleInsert = Database['public']['Tables']['roles']['Insert'];
type RoleUpdate = Database['public']['Tables']['roles']['Update'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

function mapRole(dbRole: DbRole): Role {
  return {
    id: dbRole.id,
    name: dbRole.name,
    permissions: dbRole.permissions as string[],
    organizationId: dbRole.organization_id,
    isDefault: dbRole.is_default,
    createdAt: dbRole.created_at,
    updatedAt: dbRole.updated_at,
  };
}

function mapRoleDropdown(dbRole: DbRole): RoleDropdown {
  return {
    id: dbRole.id,
    name: dbRole.name,
  };
}

export async function getRoles(): Promise<Role[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return (data || []).map(mapRole);
}

export async function getRolesDropdown(): Promise<RoleDropdown[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('roles')
    .select('id, name')
    .order('name');

  if (error) throw new Error(error.message);
  return (data || []).map(mapRoleDropdown);
}

export async function getRole(id: string): Promise<Role> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return mapRole(data);
}

export async function createRole(
  role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Role> {
  const supabase = createClient();
  const insertData: RoleInsert = {
    name: role.name,
    permissions: role.permissions,
    organization_id: role.organizationId,
    is_default: role.isDefault,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('roles') as any)
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRole(data);
}

export async function updateRole(
  id: string,
  updates: Partial<Pick<Role, 'name' | 'permissions' | 'isDefault'>>,
): Promise<Role> {
  const supabase = createClient();

  const dbUpdates: RoleUpdate = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.permissions !== undefined)
    dbUpdates.permissions = updates.permissions;
  if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('roles') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRole(data);
}

export async function deleteRole(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('roles').delete().eq('id', id);

  if (error) throw new Error(error.message);
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organizationId: string;
  roleId: string | null;
  status: 'invited' | 'active' | 'inactive' | 'blocked';
  isActive: boolean;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  organization?: {
    id: string;
    name: string;
    slug: string;
    domain: string;
    status: string;
  };
}

function mapUser(
  dbUser: DbUser & {
    role?: DbRole | null;
    organization?: DbOrganization | null;
  },
): UserProfile {
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    organizationId: dbUser.organization_id,
    roleId: dbUser.role_id,
    status: dbUser.status,
    isActive: dbUser.is_active,
    onboarded: dbUser.onboarded,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    role: dbUser.role ? mapRole(dbUser.role) : undefined,
    organization: dbUser.organization
      ? {
          id: dbUser.organization.id,
          name: dbUser.organization.name,
          slug: dbUser.organization.slug,
          domain: dbUser.organization.domain,
          status: dbUser.organization.status,
        }
      : undefined,
  };
}

export async function getCurrentUser(): Promise<UserProfile> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .select('*, role:roles(*), organization:organizations(*)')
    .eq('id', user.id)
    .single();

  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function updateProfile(updates: {
  firstName?: string;
  lastName?: string;
}): Promise<UserProfile> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const dbUpdates: UserUpdate = {};
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('users') as any)
    .update(dbUpdates)
    .eq('id', user.id)
    .select('*, role:roles(*), organization:organizations(*)')
    .single();

  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function blockUser(id: string): Promise<void> {
  const supabase = createClient();
  const updateData: UserUpdate = { status: 'blocked', is_active: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function unblockUser(id: string): Promise<void> {
  const supabase = createClient();
  const updateData: UserUpdate = { status: 'active', is_active: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function updateUser(
  id: string,
  updates: {
    firstName?: string;
    lastName?: string;
    roleId?: string;
  },
): Promise<void> {
  const supabase = createClient();

  const dbUpdates: UserUpdate = {};
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
  if (updates.roleId !== undefined) dbUpdates.role_id = updates.roleId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export interface AuditLog {
  id: string;
  organizationId: string | null;
  actorId: string | null;
  method: string;
  path: string;
  action: string;
  statusCode: number;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

function mapAuditLog(dbLog: DbAuditLog): AuditLog {
  return {
    id: dbLog.id,
    organizationId: dbLog.organization_id,
    actorId: dbLog.actor_id,
    method: dbLog.method,
    path: dbLog.path,
    action: dbLog.action,
    statusCode: dbLog.status_code,
    metadata: dbLog.metadata as Record<string, unknown> | null,
    ipAddress: dbLog.ip_address,
    userAgent: dbLog.user_agent,
    duration: dbLog.duration,
    createdAt: dbLog.created_at,
    updatedAt: dbLog.updated_at,
  };
}

export async function getAuditLog(id: string): Promise<AuditLog> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return mapAuditLog(data);
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UserListItem extends UserProfile {
  invitedBy: string | null;
  inviter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

type UserWithRole = DbUser & {
  role: { id: string; name: string } | null;
};

export async function getUsers(
  params: GetUsersParams = {},
): Promise<PaginatedResponse<UserListItem>> {
  const { page = 1, limit = 10, status, search } = params;
  const supabase = createClient();

  let query = supabase
    .from('users')
    .select('*, role:roles(id, name)', { count: 'exact' });

  if (status) {
    query = query.eq('status', status as DbUser['status']);
  }

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const typedData = data as unknown as UserWithRole[];
  const users: UserListItem[] = (typedData || []).map((dbUser) => ({
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    organizationId: dbUser.organization_id,
    roleId: dbUser.role_id,
    status: dbUser.status,
    isActive: dbUser.is_active,
    onboarded: dbUser.onboarded,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    role: dbUser.role
      ? {
          id: dbUser.role.id,
          name: dbUser.role.name,
          permissions: [],
          organizationId: '',
          isDefault: false,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    invitedBy: dbUser.invited_by,
    inviter: null,
  }));

  return {
    data: users,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  method?: string;
}

export interface AuditLogWithActor extends AuditLog {
  actor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

type AuditLogWithActorDb = DbAuditLog & {
  actor: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export async function getAuditLogs(
  params: GetAuditLogsParams = {},
): Promise<PaginatedResponse<AuditLogWithActor>> {
  const { page = 1, limit = 10, action, method } = params;
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select(
      '*, actor:users!audit_logs_actor_id_fkey(id, first_name, last_name, email)',
      { count: 'exact' },
    );

  if (action) {
    query = query.ilike('action', `%${action}%`);
  }

  if (method && method !== 'all') {
    query = query.eq('method', method);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const typedData = data as unknown as AuditLogWithActorDb[];
  const logs: AuditLogWithActor[] = (typedData || []).map((dbLog) => ({
    id: dbLog.id,
    organizationId: dbLog.organization_id,
    actorId: dbLog.actor_id,
    method: dbLog.method,
    path: dbLog.path,
    action: dbLog.action,
    statusCode: dbLog.status_code,
    metadata: dbLog.metadata as Record<string, unknown> | null,
    ipAddress: dbLog.ip_address,
    userAgent: dbLog.user_agent,
    duration: dbLog.duration,
    createdAt: dbLog.created_at,
    updatedAt: dbLog.updated_at,
    actor: dbLog.actor
      ? {
          id: dbLog.actor.id,
          firstName: dbLog.actor.first_name,
          lastName: dbLog.actor.last_name,
          email: dbLog.actor.email,
        }
      : null,
  }));

  return {
    data: logs,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
