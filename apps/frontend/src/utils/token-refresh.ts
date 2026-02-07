'use client';

import { ApiError } from '@/utils/error-class';
import { API_URL, API_ROUTES } from '@/config/api-routes';
import {
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

function waitForRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

export function canAttemptRefresh(): boolean {
  return !!getRefreshToken();
}

export async function performTokenRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}${API_ROUTES.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const text = await response.text();
    let data: { data: { accessToken: string; refreshToken: string } };
    try {
      data = JSON.parse(text);
    } catch {
      clearTokens();
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = data.data;

    setToken(accessToken);
    setRefreshToken(newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    clearTokens();
    return null;
  }
}

export async function refreshWithQueueing(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError('No refresh token', 401);
  }

  if (isRefreshing) {
    return waitForRefresh();
  }

  isRefreshing = true;
  try {
    const result = await performTokenRefresh();
    if (!result) {
      throw new ApiError('Session expired', 401);
    }
    processQueue(null, result.accessToken);
    return result.accessToken;
  } catch (err) {
    processQueue(err as Error, null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}
