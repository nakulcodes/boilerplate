"use client";

import { ApiError } from "@/utils/error-class";
import { getRuntimeConfig } from "@/utils/runtime-config";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const config = await getRuntimeConfig();
  if (!config || !config.apiUrl) {
    throw new ApiError("API URL is not configured at runtime", 500);
  }
  const baseUrl = config.apiUrl + "/api";

  try {
    const defaultOptions: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const data = await response.json();
    if (!data.success) {
      if (response.status === 401) {
        throw new ApiError("Unauthorized", 401);
      }
      throw new ApiError(data.message, response.status);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("An unexpected error occurred", 500);
  }
}
