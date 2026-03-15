import type { MetadataRoute } from 'next';
import { buildAbsoluteUrl } from '@/lib/seo';

const PUBLIC_ROUTES = ['/', '/tool', '/funktionsweise', '/maschinenstundensatz-fertigung', '/impressum', '/datenschutz'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: buildAbsoluteUrl(route),
    lastModified,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
