'use client';

import { useCallback } from 'react';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import {
  setToken,
  setRefreshToken,
  saveOriginalTokens,
  getOriginalToken,
  getOriginalRefreshToken,
  clearOriginalTokens,
  hasOriginalTokens,
} from '@/utils/cookies';
import { toast } from '@/lib/toast';
import type { LoginResponse } from '@/types/user.type';

export function useImpersonation() {
  const isImpersonating = hasOriginalTokens();

  const startImpersonation = useCallback(async (targetUserId: string) => {
    try {
      saveOriginalTokens();
      const data = await fetchApi<LoginResponse>(API_ROUTES.AUTH.IMPERSONATE, {
        method: 'POST',
        body: JSON.stringify({ targetUserId }),
      });
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      window.location.href = '/dashboard';
    } catch (err: any) {
      clearOriginalTokens();
      toast.error(err.message || 'Failed to impersonate user');
    }
  }, []);

  const stopImpersonation = useCallback(() => {
    const originalToken = getOriginalToken();
    const originalRefreshToken = getOriginalRefreshToken();
    if (originalToken && originalRefreshToken) {
      setToken(originalToken);
      setRefreshToken(originalRefreshToken);
    }
    clearOriginalTokens();
    window.location.href = '/dashboard';
  }, []);

  return { isImpersonating, startImpersonation, stopImpersonation };
}
