import Link from 'next/link';
import type { Metadata } from 'next';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata({
  title: 'Seite nicht gefunden',
  description: 'Die angeforderte Seite konnte nicht gefunden werden.',
});

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">404 – Seite nicht gefunden</h1>
        <p className="text-gray-700 mb-8">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium">
            Zur Startseite
          </Link>
          <Link href="/funktionsweise" className="text-blue-700 hover:text-blue-900 font-medium">
            Funktionsweise ansehen
          </Link>
        </div>
      </div>
    </main>
  );
}
