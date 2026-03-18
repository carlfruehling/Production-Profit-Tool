'use client';

import { FormEvent, useState } from 'react';

type AnalyticsResponse = {
  configured: boolean;
  windowDays: number;
  totals: {
    uniqueVisitors: number;
    toolTesters: number;
    accountCreators: number;
    pageViews: number;
    toolCompletions: number;
    accountRegistrations: number;
  };
  conversions: {
    visitorToToolRate: number;
    visitorToRegistrationRate: number;
    toolToRegistrationRate: number;
  };
  daily: Array<{
    date: string;
    visitors: number;
    toolTesters: number;
    accountCreators: number;
  }>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    path: string | null;
    created_at: string;
  }>;
};

const DAY_OPTIONS = [7, 30, 90];

function formatEventLabel(eventType: string) {
  if (eventType === 'page_view') {
    return 'Seitenbesuch';
  }

  if (eventType === 'tool_calculation_completed') {
    return 'Tool erfolgreich genutzt';
  }

  if (eventType === 'account_registered') {
    return 'Account erstellt';
  }

  return eventType;
}

export default function AnalyticsDashboard() {
  const [adminToken, setAdminToken] = useState('');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  const handleLoad = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics-admin?days=${days}`, {
        method: 'GET',
        headers: {
          'x-admin-token': adminToken,
        },
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? 'Analytics konnten nicht geladen werden');
      }

      setData(body as AnalyticsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics konnten nicht geladen werden');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleLoad} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.5fr_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Admin-Token</label>
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Token aus .env.local"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Zeitraum</label>
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {DAY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} Tage</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Lädt...' : 'Auswerten'}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>

      {data && !data.configured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          Die Tabelle für Analytics-Ereignisse fehlt noch. Führe zuerst das SQL aus der Setup-Dokumentation aus.
        </div>
      )}

      {data && data.configured && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Eindeutige Besucher</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totals.uniqueVisitors}</p>
              <p className="mt-2 text-sm text-slate-600">{data.totals.pageViews} Seitenaufrufe im Zeitraum</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Tool getestet</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totals.toolTesters}</p>
              <p className="mt-2 text-sm text-slate-600">{data.conversions.visitorToToolRate}% der Besucher</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Account erstellt</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totals.accountCreators}</p>
              <p className="mt-2 text-sm text-slate-600">{data.conversions.visitorToRegistrationRate}% der Besucher</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <p className="text-sm text-blue-700">Visitor → Tool</p>
              <p className="mt-2 text-2xl font-semibold text-blue-950">{data.conversions.visitorToToolRate}%</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-sm text-emerald-700">Visitor → Registrierung</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-950">{data.conversions.visitorToRegistrationRate}%</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
              <p className="text-sm text-violet-700">Tool → Registrierung</p>
              <p className="mt-2 text-2xl font-semibold text-violet-950">{data.conversions.toolToRegistrationRate}%</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Tägliche Entwicklung</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Datum</th>
                      <th className="pb-3 pr-4 font-medium">Besucher</th>
                      <th className="pb-3 pr-4 font-medium">Tool</th>
                      <th className="pb-3 font-medium">Registrierungen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((bucket) => (
                      <tr key={bucket.date} className="border-t border-slate-100 text-slate-700">
                        <td className="py-3 pr-4">{bucket.date}</td>
                        <td className="py-3 pr-4">{bucket.visitors}</td>
                        <td className="py-3 pr-4">{bucket.toolTesters}</td>
                        <td className="py-3">{bucket.accountCreators}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Letzte Ereignisse</h2>
              <div className="mt-4 space-y-3">
                {data.recentEvents.length === 0 && (
                  <p className="text-sm text-slate-500">Noch keine Ereignisse im gewählten Zeitraum.</p>
                )}

                {data.recentEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{formatEventLabel(event.event_type)}</p>
                    <p className="text-xs text-slate-500">{event.path || 'ohne Pfad'} • {new Date(event.created_at).toLocaleString('de-DE')}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}