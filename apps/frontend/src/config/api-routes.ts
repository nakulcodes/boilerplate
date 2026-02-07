const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1';

export const API_URL = `${API_BASE}${API_PREFIX}`;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/reset/request',
    RESET_PASSWORD: '/auth/reset',
    UPDATE_PASSWORD: '/auth/update-password',
    GOOGLE_CALLBACK: '/auth/google/callback',
    IMPERSONATE: '/auth/impersonate',
  },
  USERS: {
    ME: '/users/me',
    PROFILE: '/users/profile',
    LIST: '/users/list',
    DROPDOWN: (options?: {
      fields?: string[];
      paginate?: boolean;
      page?: number;
      limit?: number;
      search?: string;
    }) => {
      const params = new URLSearchParams();
      if (options?.fields?.length)
        params.set('fields', options.fields.join(','));
      if (options?.paginate) params.set('paginate', 'true');
      if (options?.page) params.set('page', String(options.page));
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.search) params.set('search', options.search);
      const query = params.toString();
      return query ? `/users?${query}` : '/users';
    },
    INVITE: '/users/invite',
    CREATE: '/users/create',
    ACCEPT_INVITE: '/users/accept-invite',
    RESEND_INVITE: '/users/resend-invite',
    UPDATE: (id: string) => `/users/${id}` as const,
    BLOCK: (id: string) => `/users/${id}/block` as const,
    UNBLOCK: (id: string) => `/users/${id}/unblock` as const,
    EXPORT: (options?: {
      format: 'csv' | 'xlsx';
      status?: string;
      search?: string;
    }) => {
      const params = new URLSearchParams();
      params.set('format', options?.format || 'csv');
      if (options?.status) params.set('status', options.status);
      if (options?.search) params.set('search', options.search);
      return `/users/export?${params}`;
    },
    IMPORT: '/users/import',
  },
  ROLES: {
    LIST: '/roles',
    LIST_FULL: '/roles/list',
    CREATE: '/roles',
    GET: (id: string) => `/roles/${id}` as const,
    UPDATE: (id: string) => `/roles/${id}` as const,
    DELETE: (id: string) => `/roles/${id}` as const,
  },
  AUDIT: {
    LIST: '/audit/list',
    GET: (id: string) => `/audit/${id}` as const,
  },
  INTEGRATIONS: {
    LIST: '/integrations',
    CONNECT: (provider: string) => `/integrations/${provider}/connect` as const,
    DISCONNECT: (provider: string) => `/integrations/${provider}` as const,
  },
  STORAGE: {
    UPLOAD_URL: (options: {
      extension: string;
      type: 'document' | 'image' | 'file';
    }) => {
      const params = new URLSearchParams();
      params.set('extension', options.extension);
      params.set('type', options.type);
      return `/storage/upload-url?${params}`;
    },
  },
  ORGANIZATION: {
    GET: '/organization',
    UPDATE: '/organization',
  },
} as const;

export function buildApiUrl(route: string): string {
  return `${API_URL}${route}`;
}
