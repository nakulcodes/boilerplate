import {
  IntegrationCategory,
  OrganizationIntegrationStatus,
} from '@boilerplate/shared';

export { IntegrationCategory, OrganizationIntegrationStatus };

export type IntegrationStatus = OrganizationIntegrationStatus;

export interface IntegrationListItem {
  id: string;
  provider: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  category: IntegrationCategory;
  isConnected: boolean;
  isConfigured: boolean;
  accountEmail?: string | null;
  accountName?: string | null;
  connectedAt?: string;
  status?: IntegrationStatus;
  errorMessage?: string | null;
}
