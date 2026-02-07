'use client';

import { JWTPayload } from '@/types/user.type';
import { Permission } from '@/types/permissions.type';
import { createClient } from '@/lib/supabase';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';

interface CustomClaims {
  organization_id?: string;
  permissions?: string[];
  first_name?: string;
  last_name?: string | null;
  role_id?: string | null;
}

interface SessionContextType {
  user: JWTPayload | null;
  setUser: (user: JWTPayload | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  supabaseSession: Session | null;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
  supabaseSession: null,
});

interface SessionProviderProps {
  children: ReactNode;
}

function extractClaimsFromToken(accessToken: string): CustomClaims {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return {
      organization_id: payload.organization_id,
      permissions: payload.permissions || [],
      first_name: payload.first_name,
      last_name: payload.last_name,
      role_id: payload.role_id,
    };
  } catch {
    return {};
  }
}

function mapToJWTPayload(
  user: User,
  claims: CustomClaims,
  accessToken: string,
): JWTPayload | null {
  if (!claims.organization_id) {
    return null;
  }

  let exp: number | undefined;
  let iat: number | undefined;
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    exp = payload.exp;
    iat = payload.iat;
  } catch {}

  return {
    userId: user.id,
    email: user.email || '',
    organizationId: claims.organization_id,
    permissions: (claims.permissions || []) as Permission[],
    firstName: claims.first_name,
    lastName: claims.last_name,
    exp,
    iat,
  };
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSupabaseSession(null);
      router.push('/');
    }
  }, [router, supabase]);

  useEffect(() => {
    async function initSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && session.access_token) {
        const claims = extractClaimsFromToken(session.access_token);
        const jwtPayload = mapToJWTPayload(
          session.user,
          claims,
          session.access_token,
        );
        setUser(jwtPayload);
        setSupabaseSession(session);
      }

      setIsLoading(false);
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && session.access_token) {
        const claims = extractClaimsFromToken(session.access_token);
        const jwtPayload = mapToJWTPayload(
          session.user,
          claims,
          session.access_token,
        );
        setUser(jwtPayload);
        setSupabaseSession(session);
      } else {
        setUser(null);
        setSupabaseSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isAuthenticated = !!user;

  return (
    <SessionContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated,
        logout,
        supabaseSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
