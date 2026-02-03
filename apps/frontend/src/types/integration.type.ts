export type IntegrationCategory =
  | 'calendar'
  | 'video_conferencing'
  | 'messaging'
  | 'productivity';

export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'expired'
  | 'error';

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
