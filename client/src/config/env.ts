const DEFAULT_API_BASE_URL = '/api';

/**
 * Resolves the API base URL from Vite environment variables and ensures it ends with `/api`
 * without creating duplicate `/api/api` segments.
 */
export function resolveApiBaseUrl(): string {
  const rawUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!rawUrl) {
    return DEFAULT_API_BASE_URL;
  }

  const normalized = rawUrl.replace(/\/+$/, '');
  if (normalized === '/api' || normalized.endsWith('/api')) {
    return normalized;
  }

  return `${normalized}/api`;
}

/**
 * Resolves the Socket.IO server origin from `VITE_SOCKET_URL`, falling back to the
 * origin portion of `VITE_API_URL` or `window.location.origin`.
 */
export function resolveSocketUrl(): string {
  const rawSocketUrl = (import.meta.env.VITE_SOCKET_URL || '').trim();
  if (rawSocketUrl) {
    return rawSocketUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }

  const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (rawApiUrl && /^https?:\/\//i.test(rawApiUrl)) {
    return rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }

  return window.location.origin;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const SOCKET_URL = resolveSocketUrl();
