'use client';

import { ApiError } from '@/utils/error-class';
import { API_URL, API_ROUTES } from '@/config/api-routes';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearTokens,
} from '@/utils/cookies';

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null) {
  refreshQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token!);
    }
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError('No refresh token', 401);
  }

  const response = await fetch(`${API_URL}${API_ROUTES.AUTH.REFRESH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new ApiError('Session expired', 401);
  }

  const data = await response.json();
  const { accessToken, refreshToken: newRefreshToken } = data.data;

  setToken(accessToken);
  setRefreshToken(newRefreshToken);

  return accessToken;
}

function waitForRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

interface PaginatedBackendResponse<T = unknown> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface StandardBackendResponse<T = unknown> {
  data: T;
}

function isPaginatedResponse<T>(
  response: unknown,
): response is PaginatedBackendResponse<T> {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const hasDataArray =
    'data' in response &&
    Array.isArray((response as Record<string, unknown>).data);
  const hasPaginationMeta =
    'total' in response && 'page' in response && 'limit' in response;

  return hasDataArray && hasPaginationMeta;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && getRefreshToken()) {
    let newToken: string;

    if (isRefreshing) {
      newToken = await waitForRefresh();
    } else {
      isRefreshing = true;
      try {
        newToken = await refreshAccessToken();
        processQueue(null, newToken);
      } catch (err) {
        processQueue(err as Error, null);
        isRefreshing = false;
        throw err;
      }
      isRefreshing = false;
    }

    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      },
    });

    const retryData = await retryResponse.json();

    if (!retryResponse.ok) {
      throw new ApiError(
        retryData.message || 'Request failed',
        retryResponse.status,
      );
    }

    return retryData.data as T;
  }

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens();
      throw new ApiError('Unauthorized', 401);
    }
    throw new ApiError(data.message || 'Request failed', response.status);
  }

  if (isPaginatedResponse(data)) {
    return data as T;
  }

  if (data && typeof data === 'object' && 'data' in data) {
    return (data as StandardBackendResponse).data as T;
  }

  return data as T;
}
