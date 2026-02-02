const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function getRefreshToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REFRESH_TOKEN_KEY}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string, maxAgeSec: number = 3600): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

export function setRefreshToken(
  token: string,
  maxAgeSec: number = 30 * 24 * 3600,
): void {
  document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

export function clearTokens(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
}
