import { Permission } from './permissions.type';
import { UserStatus } from '@boilerplate/shared';

export { UserStatus };

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
  slug: string;
  domain: string;
  logoUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  organizationId: string;
  permissions: Permission[];
  firstName?: string;
  lastName?: string | null;
  impersonatedBy?: string;
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

export interface UserDropdownItem {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  role?: { id: string; name: string } | null;
}

export interface UserDropdownPaginatedResponse {
  data: UserDropdownItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserImportError {
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export interface UserImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createdCount: number;
  skippedCount: number;
  errors: UserImportError[];
}
