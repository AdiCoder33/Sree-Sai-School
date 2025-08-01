export const API_BASE = import.meta.env.VITE_API_URL;

// Base URL without the `/api` suffix
export const BASE_URL = API_BASE.replace(/\/api\/?$/, '');

/**
 * Prefix the given path with the API base URL if it is not already absolute.
 * @param path Relative or absolute path to an asset
 */
export function withBaseUrl(path: string | undefined | null): string | undefined {
  if (!path) return path || undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
