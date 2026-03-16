import type { Metadata } from 'next';

const DEFAULT_DEV_SITE_URL = 'http://localhost:3000';
const DEFAULT_PROD_SITE_URL = 'https://production-profit-tool.fruehling-corporate.de';
const DEFAULT_SOCIAL_IMAGE_PATH = '/social-preview.svg';

export const SITE_NAME = 'Produktions-Profit-Tool';

function normalizeSiteUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitSiteUrl) {
    return normalizeSiteUrl(explicitSiteUrl);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return DEFAULT_PROD_SITE_URL;
  }

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

  return DEFAULT_DEV_SITE_URL;
}

export function buildAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function getCanonicalHost() {
  return new URL(DEFAULT_PROD_SITE_URL).host;
}

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
};

export function createPublicMetadata({
  title,
  description,
  path,
  type = 'website',
}: PublicMetadataInput): Metadata {
  const canonicalUrl = buildAbsoluteUrl(path);
  const socialImage = buildAbsoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type,
      locale: 'de_DE',
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} Social Preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
  };
}

type NoIndexMetadataInput = {
  title: string;
  description: string;
};

export function createNoIndexMetadata({ title, description }: NoIndexMetadataInput): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}
