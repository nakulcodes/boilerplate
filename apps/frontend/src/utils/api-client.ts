'use client';

import { API_URL } from '@/config/api-routes';
import { getToken, getRefreshToken, clearTokens } from '@/utils/cookies';
import { parseApiResponse } from '@/utils/api-response';
import { refreshWithQueueing, canAttemptRefresh } from '@/utils/token-refresh';
import { ApiError } from '@/utils/error-class';

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

  if (response.status === 401 && canAttemptRefresh()) {
    const newToken = await refreshWithQueueing();

    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      },
    });

    return parseApiResponse<T>(retryResponse, 'retry request');
  }

  if (response.status === 401 && getRefreshToken()) {
    clearTokens();
    throw new ApiError('Unauthorized', 401);
  }

  return parseApiResponse<T>(response, 'API request');
}
