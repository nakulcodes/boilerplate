import { Permission } from './permissions.type';

export enum UserStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  organizationId: string;
  permissions: Permission[];
  firstName?: string;
  lastName?: string | null;
  exp?: number;
  iat?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  organization: Organization;
}

export const getFullName = (
  user: Pick<User, 'firstName' | 'lastName'>,
): string => {
  return `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;
};
