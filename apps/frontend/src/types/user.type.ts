import { Permission } from "./permissions.type";

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING = "pending",
}



export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  password: string;
  role: {
    name: string;
  };
  partner: {
    name: string;
  };
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  status: UserStatus;
  partnerId: string;
  isEmpireAccount?: boolean;
  isImpersonated?: boolean;
  originalAdminEmail?: string;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  type: string;
  permissions: Permission[];
  exp?: number;
  status: UserStatus;
  partnerId: string;
  isEmpireAccount: boolean;
  isImpersonated?: boolean;
  originalAdminId?: string;
  originalAdminEmail?: string;
}
export interface ImportUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  status: UserStatus;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  partnerId?: string;
}

export interface ImportUserResponse {
  success: boolean;
  data?: {
    savedUsers: User[];
    errors: string[];
  };
  message?: string[] | string;
  error?: string;
  statusCode?: number;
}

export interface NewUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  partnerId: string;
}

export const getFullName = (user: User): string => {
  return `${user.firstName}${user.lastName ? " " + user.lastName : ""}`;
};
