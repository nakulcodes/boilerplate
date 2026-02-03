'use client';

import { JWTPayload } from '@/types/user.type';
import { getUserFromToken } from '@/utils/auth';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearTokens,
  clearOriginalTokens,
} from '@/utils/cookies';
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

async function tryRefreshSession(): Promise<JWTPayload | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(buildApiUrl(API_ROUTES.AUTH.REFRESH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    setToken(accessToken);
    setRefreshToken(newRefreshToken);

    return getUserFromToken(accessToken);
  } catch {
    clearTokens();
    return null;
  }
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      const token = getToken();
      const refreshToken = getRefreshToken();
      if (token) {
        await fetch(buildApiUrl(API_ROUTES.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken: refreshToken || '' }),
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      clearTokens();
      clearOriginalTokens();
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    async function initSession() {
      const token = getToken();
      if (token) {
        const userData = getUserFromToken(token);
        if (userData) {
          setUser(userData);
          setIsLoading(false);
          return;
        }
      }

      if (getRefreshToken()) {
        const refreshedUser = await tryRefreshSession();
        if (refreshedUser) {
          setUser(refreshedUser);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
    }

    initSession();
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
