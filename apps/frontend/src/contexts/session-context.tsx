"use client";

import { JWTPayload } from "@/types/user.type";
import { getUserFromToken } from "@/utils/auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

interface SessionContextType {
  user: JWTPayload | null;
  setUser: (user: JWTPayload | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

interface SessionProviderProps {
  children: ReactNode;
  initialUser?: JWTPayload | null;
  token?: string | null;
}

export function SessionProvider({
  children,
  initialUser,
  token,
}: SessionProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser && !!token);
  const isAuthenticated = !!user;
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      setUser(null);

      await fetch("/api/auth/logout", { method: "POST" });

      router.refresh();

      router.push("/");

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, still navigate away and reload
      router.push("/");
      window.location.reload();
    }
  }, [router]);

  useEffect(() => {
    if (!token || initialUser) return;

    const initializeUser = async () => {
      try {
        const userData = getUserFromToken(token);
        if (!userData) {
          logout();
          return;
        }
        setUser(userData as JWTPayload);
      } catch (error) {
        console.error("Error initializing user:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [token, initialUser, logout]);

  return (
    <SessionContext.Provider
      value={{ user, setUser, isLoading, isAuthenticated, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
