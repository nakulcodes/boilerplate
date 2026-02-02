"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/utils/error-class";
import { getRuntimeConfig } from "@/utils/runtime-config";

export default function ErrorBoundary({ error }: { error: ApiError }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [shouldLogout, setShouldLogout] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const config = await getRuntimeConfig();
        if (!config || !config.apiUrl) {
          throw new Error("API URL is not configured at runtime");
        }
        const response = await fetch(`${config.apiUrl}/api/auth/me`, {
          credentials: "include",
        });

        const data = await response.json();

        if (data.statusCode === 401) {
          setShouldLogout(true);
        }
      } catch (e) {
        console.error("Failed to check user status:", e);
      }
    };

    checkUserStatus();
  }, []);

  useEffect(() => {
    if (!shouldLogout) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldLogout]);

  useEffect(() => {
    const handleError = async () => {
      if (!shouldLogout || countdown > 0) return;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } catch (e) {
        console.error("Logout failed:", e);
      }
      router.push("/");
    };

    handleError();
  }, [countdown, router, shouldLogout]);

  if (!shouldLogout) {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <div className="w-full max-w-md p-8 mx-4 bg-white dark:bg-background border border-border rounded-xl dark:shadow-lg dark:shadow-gray-900/30">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-2">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              An error occurred while processing your request. Please try again
              or refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <div className="w-full max-w-md p-8 mx-4 bg-white dark:bg-background border border-border rounded-xl dark:shadow-lg dark:shadow-gray-900/30 transform transition-all">
        <div className="flex flex-col items-center space-y-4">
          {/* Alert Icon */}
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-red-600 dark:text-red-500">
            Access Denied
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-center">
            You do not have permission to access this page. Your account is
            suspended or pending.
          </p>

          <div className="relative w-20 h-20 my-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                {countdown}
              </span>
            </div>
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="40"
                cy="40"
              />
              <circle
                className="text-blue-600 dark:text-blue-500"
                strokeWidth="4"
                strokeDasharray={226.19}
                strokeDashoffset={226.19 * (1 - countdown / 10)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="40"
                cy="40"
              />
            </svg>
          </div>

          <p className="text-gray-500 dark:text-gray-400 font-medium">
            You will be logged out in {countdown} seconds
          </p>

          <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please try to log in again or contact support if the issue
              persists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
