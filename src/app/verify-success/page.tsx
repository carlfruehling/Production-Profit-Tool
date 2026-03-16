import { Metadata } from 'next';
import Link from 'next/link';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata({
  title: 'E-Mail bestätigt',
  description: 'Bestätigung der E-Mail-Adresse für das Produktions-Profit-Tool.',
});

export default function VerifySuccessPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-white py-12 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          E-Mail bestätigt!
        </h1>
        <p className="text-green-800 mb-6">
          Vielen Dank für die Bestätigung Ihrer E-Mail-Adresse. Sie haben jetzt Zugang zur vollständigen
          Analyse und den Empfehlungen.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-3">Nächste Schritte:</h3>
          <ul className="text-sm text-green-800 text-left space-y-2">
            <li>✓ Vollständige Ergebnisse freigeschalten</li>
            <li>✓ Detaillierte Diagnose verfügbar</li>
            <li>✓ Handlungsempfehlungen erhalten</li>
          </ul>
        </div>

        <Link
          href="/tool"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
        >
          Zum Tool
        </Link>
      </div>
    </main>
  );
}
