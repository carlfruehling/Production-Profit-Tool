import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import { buildAbsoluteUrl, getSiteUrl, SITE_NAME } from '@/lib/seo';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Tool zur Bewertung der Profitabilität von Fertigungsaufträgen inklusive Vollkosten-, Grenzkosten- und Kapazitätsanalyse.',
  alternates: {
    canonical: buildAbsoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: 'Profitabilität von Fertigungsaufträgen sachlich und nachvollziehbar bewerten.',
    url: buildAbsoluteUrl('/'),
    images: [
      {
        url: buildAbsoluteUrl('/social-preview.svg'),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Social Preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Profitabilität von Fertigungsaufträgen mit Vollkosten-, Grenzkosten- und Kapazitätsblick analysieren.',
    images: [buildAbsoluteUrl('/social-preview.svg')],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
