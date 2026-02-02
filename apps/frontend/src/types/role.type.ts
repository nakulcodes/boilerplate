export interface RoleResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  partner?: {
    name: string;
  };
  permissions: string[];
  isEditable: boolean | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isEditable: boolean;
  type: string;
  createdAt: string;
  partner?: {
    name: string;
  };
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
}

export interface FetchRolesResponse {
  success: boolean;
  data: RoleResponse[];
  pagination: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface UpdateRoleStatusResponse {
  success: boolean;
  data: Role;
  message?: string;
}

export interface UpdateRoleResponse {
  success: boolean;
  data: Role;
  message?: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[];
  type: string;
  partnerId?: string;
}
