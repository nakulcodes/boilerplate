const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ORIGINAL_TOKEN_KEY = 'originalToken';
const ORIGINAL_REFRESH_TOKEN_KEY = 'originalRefreshToken';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveOriginalTokens(): void {
  const token = getToken();
  const refreshToken = getRefreshToken();
  if (token) localStorage.setItem(ORIGINAL_TOKEN_KEY, token);
  if (refreshToken)
    localStorage.setItem(ORIGINAL_REFRESH_TOKEN_KEY, refreshToken);
}

export function getOriginalToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ORIGINAL_TOKEN_KEY);
}

export function getOriginalRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ORIGINAL_REFRESH_TOKEN_KEY);
}

export function clearOriginalTokens(): void {
  localStorage.removeItem(ORIGINAL_TOKEN_KEY);
  localStorage.removeItem(ORIGINAL_REFRESH_TOKEN_KEY);
}

export function hasOriginalTokens(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(ORIGINAL_TOKEN_KEY);
}
