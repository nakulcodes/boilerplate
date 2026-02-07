'use client';

import { ApiError } from '@/utils/error-class';

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

export function isPaginatedResponse<T>(
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

export function extractData<T>(data: unknown): T {
  if (isPaginatedResponse(data)) {
    return data as T;
  }

  if (data && typeof data === 'object' && 'data' in data) {
    return (data as StandardBackendResponse).data as T;
  }

  return data as T;
}

export async function parseApiResponse<T>(
  response: Response,
  context: string,
): Promise<T> {
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Server error (${response.status}): Unable to process response`,
        response.status,
      );
    }
    throw new ApiError(`Invalid response from server during ${context}`, 500);
  }

  if (!response.ok) {
    const message =
      (data as Record<string, unknown>)?.message || 'Request failed';
    throw new ApiError(String(message), response.status);
  }

  return extractData<T>(data);
}
