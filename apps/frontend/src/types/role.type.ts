export interface Role {
  id: string;
  name: string;
  permissions: string[];
  organizationId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
