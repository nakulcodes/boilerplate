import { gql } from '@apollo/client';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react';
import type {
  MutationHookOptions,
  QueryHookOptions,
  LazyQueryHookOptions,
  MutationResult,
  QueryResult,
  LazyQueryResultTuple,
} from '@apollo/client/react';
import type { DocumentNode } from 'graphql';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  JSON: { input: Record<string, unknown>; output: Record<string, unknown> };
};

export enum UserStatus {
  Active = 'ACTIVE',
  Blocked = 'BLOCKED',
  Inactive = 'INACTIVE',
  Invited = 'INVITED',
}

export enum OrganizationStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED',
}

export enum HttpMethod {
  Delete = 'DELETE',
  Get = 'GET',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT',
}

export type Organization = {
  __typename?: 'Organization';
  id: string;
  name: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  __typename?: 'Role';
  id: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  __typename?: 'User';
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  status: UserStatus;
  isActive: boolean;
  onboarded: boolean;
  avatarUrl: string | null;
  role: Role | null;
  organization: Organization | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  __typename?: 'AuditLog';
  id: string;
  action: string;
  method: string;
  path: string;
  statusCode: number;
  ip: string | null;
  userAgent: string | null;
  requestBody: Record<string, unknown> | null;
  responseBody: Record<string, unknown> | null;
  timestamp: string;
  actor: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;
  createdAt: string;
};

export type TokenResponse = {
  __typename?: 'TokenResponse';
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type SuccessResponse = {
  __typename?: 'SuccessResponse';
  success: boolean;
  message: string | null;
};

export type InviteUserResponse = {
  __typename?: 'InviteUserResponse';
  success: boolean;
  userId: string;
  inviteLink: string;
  emailSent: boolean;
};

export type ResendInviteResponse = {
  __typename?: 'ResendInviteResponse';
  success: boolean;
  inviteLink: string;
  emailSent: boolean;
};

export type PaginationMeta = {
  __typename?: 'PaginationMeta';
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedUserList = {
  __typename?: 'PaginatedUserList';
  data: User[];
  meta: PaginationMeta;
};

export type PaginatedAuditLogList = {
  __typename?: 'PaginatedAuditLogList';
  data: AuditLog[];
  meta: PaginationMeta;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string | null;
  organizationName: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type PasswordResetRequestInput = {
  email: string;
};

export type PasswordResetInput = {
  token: string;
  newPassword: string;
};

export type AcceptInviteInput = {
  token: string;
  password: string;
  firstName: string;
  lastName?: string | null;
};

export type InviteUserInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roleId?: string | null;
};

export type ListUsersInput = {
  page?: number | null;
  limit?: number | null;
  status?: UserStatus | null;
  search?: string | null;
};

export type UpdateUserInput = {
  firstName?: string | null;
  lastName?: string | null;
  roleId?: string | null;
};

export type UpdateProfileInput = {
  firstName: string;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export type CreateRoleInput = {
  name: string;
  permissions: string[];
};

export type UpdateRoleInput = {
  name?: string | null;
  permissions?: string[] | null;
};

export type ListAuditLogsInput = {
  page?: number | null;
  limit?: number | null;
  actorId?: string | null;
  action?: string | null;
  method?: HttpMethod | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: AuthResponse;
};

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;

export type RegisterMutation = {
  __typename?: 'Mutation';
  register: AuthResponse;
};

export type RefreshTokenMutationVariables = Exact<Record<string, never>>;

export type RefreshTokenMutation = {
  __typename?: 'Mutation';
  refreshToken: TokenResponse;
};

export type LogoutMutationVariables = Exact<Record<string, never>>;

export type LogoutMutation = {
  __typename?: 'Mutation';
  logout: SuccessResponse;
};

export type UpdatePasswordMutationVariables = Exact<{
  input: UpdatePasswordInput;
}>;

export type UpdatePasswordMutation = {
  __typename?: 'Mutation';
  updatePassword: SuccessResponse;
};

export type RequestPasswordResetMutationVariables = Exact<{
  input: PasswordResetRequestInput;
}>;

export type RequestPasswordResetMutation = {
  __typename?: 'Mutation';
  requestPasswordReset: SuccessResponse;
};

export type ResetPasswordMutationVariables = Exact<{
  input: PasswordResetInput;
}>;

export type ResetPasswordMutation = {
  __typename?: 'Mutation';
  resetPassword: SuccessResponse;
};

export type MeQueryVariables = Exact<Record<string, never>>;

export type MeQuery = {
  __typename?: 'Query';
  me: User;
};

export type UsersQueryVariables = Exact<{
  input?: InputMaybe<ListUsersInput>;
}>;

export type UsersQuery = {
  __typename?: 'Query';
  users: PaginatedUserList;
};

export type InviteUserMutationVariables = Exact<{
  input: InviteUserInput;
}>;

export type InviteUserMutation = {
  __typename?: 'Mutation';
  inviteUser: InviteUserResponse;
};

export type AcceptInviteMutationVariables = Exact<{
  input: AcceptInviteInput;
}>;

export type AcceptInviteMutation = {
  __typename?: 'Mutation';
  acceptInvite: AuthResponse;
};

export type ResendInviteMutationVariables = Exact<{
  userId: string;
}>;

export type ResendInviteMutation = {
  __typename?: 'Mutation';
  resendInvite: ResendInviteResponse;
};

export type UpdateUserMutationVariables = Exact<{
  id: string;
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser: User;
};

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;

export type UpdateProfileMutation = {
  __typename?: 'Mutation';
  updateProfile: User;
};

export type BlockUserMutationVariables = Exact<{
  id: string;
}>;

export type BlockUserMutation = {
  __typename?: 'Mutation';
  blockUser: SuccessResponse;
};

export type UnblockUserMutationVariables = Exact<{
  id: string;
}>;

export type UnblockUserMutation = {
  __typename?: 'Mutation';
  unblockUser: SuccessResponse;
};

export type RolesQueryVariables = Exact<Record<string, never>>;

export type RolesQuery = {
  __typename?: 'Query';
  roles: Role[];
};

export type RoleQueryVariables = Exact<{
  id: string;
}>;

export type RoleQuery = {
  __typename?: 'Query';
  role: Role;
};

export type CreateRoleMutationVariables = Exact<{
  input: CreateRoleInput;
}>;

export type CreateRoleMutation = {
  __typename?: 'Mutation';
  createRole: Role;
};

export type UpdateRoleMutationVariables = Exact<{
  id: string;
  input: UpdateRoleInput;
}>;

export type UpdateRoleMutation = {
  __typename?: 'Mutation';
  updateRole: Role;
};

export type DeleteRoleMutationVariables = Exact<{
  id: string;
}>;

export type DeleteRoleMutation = {
  __typename?: 'Mutation';
  deleteRole: SuccessResponse;
};

export type AuditLogsQueryVariables = Exact<{
  input?: InputMaybe<ListAuditLogsInput>;
}>;

export type AuditLogsQuery = {
  __typename?: 'Query';
  auditLogs: PaginatedAuditLogList;
};

export type AuditLogQueryVariables = Exact<{
  id: string;
}>;

export type AuditLogQuery = {
  __typename?: 'Query';
  auditLog: AuditLog;
};

export const LoginDocument: DocumentNode = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        status
        isActive
        onboarded
        avatarUrl
        role {
          id
          name
          permissions
        }
        organization {
          id
          name
          status
        }
      }
    }
  }
`;

export function useLoginMutation(
  baseOptions?: MutationHookOptions<LoginMutation, LoginMutationVariables>,
) {
  return useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    baseOptions,
  );
}

export const RegisterDocument: DocumentNode = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        status
        isActive
        onboarded
        avatarUrl
        role {
          id
          name
          permissions
        }
        organization {
          id
          name
          status
        }
      }
    }
  }
`;

export function useRegisterMutation(
  baseOptions?: MutationHookOptions<
    RegisterMutation,
    RegisterMutationVariables
  >,
) {
  return useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument,
    baseOptions,
  );
}

export const RefreshTokenDocument: DocumentNode = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      refreshToken
    }
  }
`;

export function useRefreshTokenMutation(
  baseOptions?: MutationHookOptions<
    RefreshTokenMutation,
    RefreshTokenMutationVariables
  >,
) {
  return useMutation<RefreshTokenMutation, RefreshTokenMutationVariables>(
    RefreshTokenDocument,
    baseOptions,
  );
}

export const LogoutDocument: DocumentNode = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export function useLogoutMutation(
  baseOptions?: MutationHookOptions<LogoutMutation, LogoutMutationVariables>,
) {
  return useMutation<LogoutMutation, LogoutMutationVariables>(
    LogoutDocument,
    baseOptions,
  );
}

export const UpdatePasswordDocument: DocumentNode = gql`
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input) {
      success
    }
  }
`;

export function useUpdatePasswordMutation(
  baseOptions?: MutationHookOptions<
    UpdatePasswordMutation,
    UpdatePasswordMutationVariables
  >,
) {
  return useMutation<UpdatePasswordMutation, UpdatePasswordMutationVariables>(
    UpdatePasswordDocument,
    baseOptions,
  );
}

export const RequestPasswordResetDocument: DocumentNode = gql`
  mutation RequestPasswordReset($input: PasswordResetRequestInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`;

export function useRequestPasswordResetMutation(
  baseOptions?: MutationHookOptions<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >,
) {
  return useMutation<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >(RequestPasswordResetDocument, baseOptions);
}

export const ResetPasswordDocument: DocumentNode = gql`
  mutation ResetPassword($input: PasswordResetInput!) {
    resetPassword(input: $input) {
      success
    }
  }
`;

export function useResetPasswordMutation(
  baseOptions?: MutationHookOptions<
    ResetPasswordMutation,
    ResetPasswordMutationVariables
  >,
) {
  return useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(
    ResetPasswordDocument,
    baseOptions,
  );
}

export const MeDocument: DocumentNode = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      status
      isActive
      onboarded
      avatarUrl
      createdAt
      updatedAt
      role {
        id
        name
        permissions
      }
      organization {
        id
        name
        status
      }
    }
  }
`;

export function useMeQuery(
  baseOptions?: QueryHookOptions<MeQuery, MeQueryVariables>,
): QueryResult<MeQuery, MeQueryVariables> {
  return useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
}

export function useMeLazyQuery(
  baseOptions?: LazyQueryHookOptions<MeQuery, MeQueryVariables>,
): LazyQueryResultTuple<MeQuery, MeQueryVariables> {
  return useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
}

export const UsersDocument: DocumentNode = gql`
  query Users($input: ListUsersInput) {
    users(input: $input) {
      data {
        id
        email
        firstName
        lastName
        status
        isActive
        onboarded
        avatarUrl
        createdAt
        updatedAt
        role {
          id
          name
          permissions
        }
      }
      meta {
        page
        limit
        total
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export function useUsersQuery(
  baseOptions?: QueryHookOptions<UsersQuery, UsersQueryVariables>,
): QueryResult<UsersQuery, UsersQueryVariables> {
  return useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
}

export function useUsersLazyQuery(
  baseOptions?: LazyQueryHookOptions<UsersQuery, UsersQueryVariables>,
): LazyQueryResultTuple<UsersQuery, UsersQueryVariables> {
  return useLazyQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    baseOptions,
  );
}

export const InviteUserDocument: DocumentNode = gql`
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      success
      userId
      inviteLink
      emailSent
    }
  }
`;

export function useInviteUserMutation(
  baseOptions?: MutationHookOptions<
    InviteUserMutation,
    InviteUserMutationVariables
  >,
) {
  return useMutation<InviteUserMutation, InviteUserMutationVariables>(
    InviteUserDocument,
    baseOptions,
  );
}

export const AcceptInviteDocument: DocumentNode = gql`
  mutation AcceptInvite($input: AcceptInviteInput!) {
    acceptInvite(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        status
        isActive
        onboarded
        avatarUrl
        role {
          id
          name
          permissions
        }
        organization {
          id
          name
          status
        }
      }
    }
  }
`;

export function useAcceptInviteMutation(
  baseOptions?: MutationHookOptions<
    AcceptInviteMutation,
    AcceptInviteMutationVariables
  >,
) {
  return useMutation<AcceptInviteMutation, AcceptInviteMutationVariables>(
    AcceptInviteDocument,
    baseOptions,
  );
}

export const ResendInviteDocument: DocumentNode = gql`
  mutation ResendInvite($userId: ID!) {
    resendInvite(userId: $userId) {
      success
      inviteLink
      emailSent
    }
  }
`;

export function useResendInviteMutation(
  baseOptions?: MutationHookOptions<
    ResendInviteMutation,
    ResendInviteMutationVariables
  >,
) {
  return useMutation<ResendInviteMutation, ResendInviteMutationVariables>(
    ResendInviteDocument,
    baseOptions,
  );
}

export const UpdateUserDocument: DocumentNode = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      status
      isActive
      onboarded
      avatarUrl
      createdAt
      updatedAt
      role {
        id
        name
        permissions
      }
    }
  }
`;

export function useUpdateUserMutation(
  baseOptions?: MutationHookOptions<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >,
) {
  return useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserDocument,
    baseOptions,
  );
}

export const UpdateProfileDocument: DocumentNode = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      firstName
      lastName
      status
      isActive
      onboarded
      avatarUrl
      createdAt
      updatedAt
      role {
        id
        name
        permissions
      }
      organization {
        id
        name
        status
      }
    }
  }
`;

export function useUpdateProfileMutation(
  baseOptions?: MutationHookOptions<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >,
) {
  return useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(
    UpdateProfileDocument,
    baseOptions,
  );
}

export const BlockUserDocument: DocumentNode = gql`
  mutation BlockUser($id: ID!) {
    blockUser(id: $id) {
      success
    }
  }
`;

export function useBlockUserMutation(
  baseOptions?: MutationHookOptions<
    BlockUserMutation,
    BlockUserMutationVariables
  >,
) {
  return useMutation<BlockUserMutation, BlockUserMutationVariables>(
    BlockUserDocument,
    baseOptions,
  );
}

export const UnblockUserDocument: DocumentNode = gql`
  mutation UnblockUser($id: ID!) {
    unblockUser(id: $id) {
      success
    }
  }
`;

export function useUnblockUserMutation(
  baseOptions?: MutationHookOptions<
    UnblockUserMutation,
    UnblockUserMutationVariables
  >,
) {
  return useMutation<UnblockUserMutation, UnblockUserMutationVariables>(
    UnblockUserDocument,
    baseOptions,
  );
}

export const RolesDocument: DocumentNode = gql`
  query Roles {
    roles {
      id
      name
      permissions
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export function useRolesQuery(
  baseOptions?: QueryHookOptions<RolesQuery, RolesQueryVariables>,
): QueryResult<RolesQuery, RolesQueryVariables> {
  return useQuery<RolesQuery, RolesQueryVariables>(RolesDocument, baseOptions);
}

export function useRolesLazyQuery(
  baseOptions?: LazyQueryHookOptions<RolesQuery, RolesQueryVariables>,
): LazyQueryResultTuple<RolesQuery, RolesQueryVariables> {
  return useLazyQuery<RolesQuery, RolesQueryVariables>(
    RolesDocument,
    baseOptions,
  );
}

export const RoleDocument: DocumentNode = gql`
  query Role($id: ID!) {
    role(id: $id) {
      id
      name
      permissions
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export function useRoleQuery(
  baseOptions: QueryHookOptions<RoleQuery, RoleQueryVariables> & {
    variables: RoleQueryVariables;
  },
): QueryResult<RoleQuery, RoleQueryVariables> {
  return useQuery<RoleQuery, RoleQueryVariables>(RoleDocument, baseOptions);
}

export function useRoleLazyQuery(
  baseOptions?: LazyQueryHookOptions<RoleQuery, RoleQueryVariables>,
): LazyQueryResultTuple<RoleQuery, RoleQueryVariables> {
  return useLazyQuery<RoleQuery, RoleQueryVariables>(RoleDocument, baseOptions);
}

export const CreateRoleDocument: DocumentNode = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id
      name
      permissions
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export function useCreateRoleMutation(
  baseOptions?: MutationHookOptions<
    CreateRoleMutation,
    CreateRoleMutationVariables
  >,
) {
  return useMutation<CreateRoleMutation, CreateRoleMutationVariables>(
    CreateRoleDocument,
    baseOptions,
  );
}

export const UpdateRoleDocument: DocumentNode = gql`
  mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) {
      id
      name
      permissions
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export function useUpdateRoleMutation(
  baseOptions?: MutationHookOptions<
    UpdateRoleMutation,
    UpdateRoleMutationVariables
  >,
) {
  return useMutation<UpdateRoleMutation, UpdateRoleMutationVariables>(
    UpdateRoleDocument,
    baseOptions,
  );
}

export const DeleteRoleDocument: DocumentNode = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id) {
      success
    }
  }
`;

export function useDeleteRoleMutation(
  baseOptions?: MutationHookOptions<
    DeleteRoleMutation,
    DeleteRoleMutationVariables
  >,
) {
  return useMutation<DeleteRoleMutation, DeleteRoleMutationVariables>(
    DeleteRoleDocument,
    baseOptions,
  );
}

export const AuditLogsDocument: DocumentNode = gql`
  query AuditLogs($input: ListAuditLogsInput) {
    auditLogs(input: $input) {
      data {
        id
        action
        method
        path
        statusCode
        ip
        userAgent
        requestBody
        responseBody
        timestamp
        createdAt
        actor {
          id
          email
          firstName
          lastName
        }
      }
      meta {
        page
        limit
        total
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export function useAuditLogsQuery(
  baseOptions?: QueryHookOptions<AuditLogsQuery, AuditLogsQueryVariables>,
): QueryResult<AuditLogsQuery, AuditLogsQueryVariables> {
  return useQuery<AuditLogsQuery, AuditLogsQueryVariables>(
    AuditLogsDocument,
    baseOptions,
  );
}

export function useAuditLogsLazyQuery(
  baseOptions?: LazyQueryHookOptions<AuditLogsQuery, AuditLogsQueryVariables>,
): LazyQueryResultTuple<AuditLogsQuery, AuditLogsQueryVariables> {
  return useLazyQuery<AuditLogsQuery, AuditLogsQueryVariables>(
    AuditLogsDocument,
    baseOptions,
  );
}

export const AuditLogDocument: DocumentNode = gql`
  query AuditLog($id: ID!) {
    auditLog(id: $id) {
      id
      action
      method
      path
      statusCode
      ip
      userAgent
      requestBody
      responseBody
      timestamp
      createdAt
      actor {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export function useAuditLogQuery(
  baseOptions: QueryHookOptions<AuditLogQuery, AuditLogQueryVariables> & {
    variables: AuditLogQueryVariables;
  },
): QueryResult<AuditLogQuery, AuditLogQueryVariables> {
  return useQuery<AuditLogQuery, AuditLogQueryVariables>(
    AuditLogDocument,
    baseOptions,
  );
}

export function useAuditLogLazyQuery(
  baseOptions?: LazyQueryHookOptions<AuditLogQuery, AuditLogQueryVariables>,
): LazyQueryResultTuple<AuditLogQuery, AuditLogQueryVariables> {
  return useLazyQuery<AuditLogQuery, AuditLogQueryVariables>(
    AuditLogDocument,
    baseOptions,
  );
}
