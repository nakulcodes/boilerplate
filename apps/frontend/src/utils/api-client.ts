"use client";

import { ApiError } from "@/utils/error-class";
import { API_URL } from "@/config/api-routes";
import { getToken } from "@/utils/cookies";

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
  response: unknown
): response is PaginatedBackendResponse<T> {
  if (!response || typeof response !== "object") {
    return false;
  }

  const hasDataArray =
    "data" in response && Array.isArray((response as Record<string, unknown>).data);
  const hasPaginationMeta =
    "total" in response && "page" in response && "limit" in response;

  return hasDataArray && hasPaginationMeta;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError("Unauthorized", 401);
    }
    throw new ApiError(data.message || "Request failed", response.status);
  }

  if (isPaginatedResponse(data)) {
    return data as T;
  }

  if (data && typeof data === "object" && "data" in data) {
    return (data as StandardBackendResponse).data as T;
  }

  return data as T;
}
