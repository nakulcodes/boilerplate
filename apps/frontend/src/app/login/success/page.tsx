"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserFromToken } from "@/utils/auth";
import { useSession } from "@/contexts/session-context";

export default function LoginSuccess() {
  const router = useRouter();
  const { setUser } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("data");

    if (!token) {
      router.push("/");
      return;
    }

    const setTokenCookie = async () => {
      try {
        const response = await fetch("/api/auth/setcookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(token),
        });

        if (!response.ok) {
          router.push("/");
          return;
        }

        const user = getUserFromToken(token);
        setUser(user);
        const route =
          user?.status === "suspended"
            ? "/no-access/suspended"
            : user?.status === "pending"
              ? "/no-access/pending"
              : "/dashboard";

        router.push(route);
      } catch (err) {
        router.push("/");
      }
    };

    setTokenCookie();
  }, [router, searchParams, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-dark-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black dark:border-white border-t-transparent"></div>
    </div>
  );
}
