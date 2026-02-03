export enum UserStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum IntegrationCategory {
  CALENDAR = 'calendar',
  VIDEO_CONFERENCING = 'video_conferencing',
  MESSAGING = 'messaging',
  PRODUCTIVITY = 'productivity',
}

export enum OrganizationIntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  EXPIRED = 'expired',
  ERROR = 'error',
}
