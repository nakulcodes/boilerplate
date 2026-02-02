'use client';

import { JWTPayload } from '@/types/user.type';
import { getUserFromToken } from '@/utils/auth';
import { getToken, clearTokens } from '@/utils/cookies';
import { buildApiUrl, API_ROUTES } from '@/config/api-routes';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';

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
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(buildApiUrl(API_ROUTES.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken: '' }),
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      clearTokens();
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const userData = getUserFromToken(token);
      if (userData) {
        setUser(userData);
      } else {
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <SessionContext.Provider
      value={{ user, setUser, isLoading, isAuthenticated, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
