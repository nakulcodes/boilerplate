const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1';

export const API_URL = `${API_BASE}${API_PREFIX}`;

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    UPDATE_PASSWORD: '/auth/update-password',
    IMPERSONATE: '/auth/impersonate',
  },
  USERS: {
    LIST: '/users/list',
    INVITE: '/users/invite',
    CREATE: '/users/create',
    ACCEPT_INVITE: '/users/accept-invite',
    RESEND_INVITE: '/users/resend-invite',
    UPDATE: (id: string) => `/users/${id}` as const,
  },
  AUDIT: {
    LIST: '/audit/list',
  },
} as const;

export function buildApiUrl(route: string): string {
  return `${API_URL}${route}`;
}
