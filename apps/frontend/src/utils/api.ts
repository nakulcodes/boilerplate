"use server";

import { cookies } from "next/headers";
import { ApiError } from "@/utils/error-class";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl =
    process.env.SERVER_URL + "/api" || "http://localhost:5002/api";

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const defaultOptions: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      return {
        success: false,
        message: data.message,
        error: data.error || "Bad Request",
        statusCode: data.statusCode || response.status,
      };
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("An unexpected error occurred", 500);
  }
}
