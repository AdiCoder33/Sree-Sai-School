export const API_BASE = import.meta.env.VITE_API_URL;

export function withBaseUrl(path: string | undefined | null): string | undefined {
  if (!path) return path || undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}
