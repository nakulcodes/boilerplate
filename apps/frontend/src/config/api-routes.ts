const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_PREFIX = "/api/v1";

export const API_URL = `${API_BASE}${API_PREFIX}`;

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/reset/request",
    RESET_PASSWORD: "/auth/reset",
    UPDATE_PASSWORD: "/auth/update-password",
    GOOGLE_CALLBACK: "/auth/google/callback",
  },
  USERS: {
    ME: "/users/me",
    PROFILE: "/users/profile",
    LIST: "/users/list",
    INVITE: "/users/invite",
    RESEND_INVITE: "/users/resend-invite",
    UPDATE: (id: string) => `/users/${id}` as const,
    BLOCK: (id: string) => `/users/${id}/block` as const,
    UNBLOCK: (id: string) => `/users/${id}/unblock` as const,
  },
  ROLES: {
    LIST: "/roles/list",
    CREATE: "/roles",
    GET: (id: string) => `/roles/${id}` as const,
    UPDATE: (id: string) => `/roles/${id}` as const,
    DELETE: (id: string) => `/roles/${id}` as const,
  },
} as const;

export function buildApiUrl(route: string): string {
  return `${API_URL}${route}`;
}
