import { Metadata } from 'next';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata({
  title: 'Analytics',
  description: 'Geschützte Conversion-Auswertung für Besucher, Tool-Nutzung und Registrierungen.',
});

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-100 via-white to-blue-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Admin-Auswertung</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Besucher, Tool-Tests und Registrierungen</h1>
          <p className="mt-3 text-lg text-slate-600">
            Die Auswertung basiert auf pseudonymisierten Ereignissen aus Seitenaufrufen, erfolgreichen Tool-Berechnungen und abgeschlossenen Registrierungen.
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </main>
  );
}