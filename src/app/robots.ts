import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tool', '/funktionsweise', '/maschinenstundensatz-fertigung', '/impressum', '/datenschutz'],
        disallow: ['/api/', '/auth', '/login', '/register', '/forgot-password', '/reset-password', '/verify-success'],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
