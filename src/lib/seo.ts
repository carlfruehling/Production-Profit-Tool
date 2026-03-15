const DEFAULT_DEV_SITE_URL = 'http://localhost:3000';
const DEFAULT_PROD_SITE_URL = 'https://production-profit-tool.fruehling-corporate.de';

function normalizeSiteUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitSiteUrl) {
    return normalizeSiteUrl(explicitSiteUrl);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionUrl) {
    const prefixed = vercelProductionUrl.startsWith('http')
      ? vercelProductionUrl
      : `https://${vercelProductionUrl}`;
    return normalizeSiteUrl(prefixed);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const prefixed = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    return normalizeSiteUrl(prefixed);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return normalizeSiteUrl(appUrl);
  }

  return isProduction ? DEFAULT_PROD_SITE_URL : DEFAULT_DEV_SITE_URL;
}

export function buildAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
