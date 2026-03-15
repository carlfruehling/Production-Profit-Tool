const DEFAULT_SITE_URL = 'http://localhost:3000';

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim()
    || process.env.NEXT_PUBLIC_APP_URL?.trim()
    || DEFAULT_SITE_URL;

  return configured.endsWith('/') ? configured.slice(0, -1) : configured;
}

export function buildAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
