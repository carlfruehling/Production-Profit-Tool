import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import { getSiteUrl } from '@/lib/seo';
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
    default: 'Produktions-Profit-Tool',
    template: '%s | Produktions-Profit-Tool',
  },
  description: 'Tool zur Bewertung der Profitabilität von Fertigungsaufträgen inklusive Vollkosten-, Grenzkosten- und Kapazitätsanalyse.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Produktions-Profit-Tool',
    title: 'Produktions-Profit-Tool',
    description: 'Profitabilität von Fertigungsaufträgen sachlich und nachvollziehbar bewerten.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Produktions-Profit-Tool',
    description: 'Profitabilität von Fertigungsaufträgen mit Vollkosten-, Grenzkosten- und Kapazitätsblick analysieren.',
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
