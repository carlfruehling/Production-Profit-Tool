'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BenchmarkComparisonCard from '@/components/BenchmarkComparisonCard';
import {
  CalculationHistoryItem,
  CalculationHistorySummary,
  CalculationInput,
  CalculationResult,
} from '@/types/calculation';

type HourlyRateMode = 'manual' | 'estimate';

export default function CalculatorForm() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [freeCalculationUsed, setFreeCalculationUsed] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<CalculationHistoryItem[]>([]);
  const [historySummary, setHistorySummary] = useState<CalculationHistorySummary | null>(null);
  const [hourlyRateMode, setHourlyRateMode] = useState<HourlyRateMode>('manual');
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const defaultValues: CalculationInput = {
    freeMachineHours: 15,
    dueDate: defaultDueDate,
    machineHourlyRate: 150,
    machinePrice: undefined,
    depreciationYears: 7,
    operatorSalary: undefined,
    productiveHoursPerYear: 1500,
    offerPrice: 5000,
    materialCost: 2500,
    setupTime: 0,
    machiningTime: 20,
  };
  const signalStyles: Record<CalculationResult['pricingSignal'], { label: string; className: string }> = {
    green: {
      label: '🟢 Vollkosten gedeckt',
      className: 'bg-green-50 border-green-300 text-green-800',
    },
    yellow: {
      label: '🟡 Unter Vollkosten, über Grenzkosten',
      className: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    },
    red: {
      label: '🔴 Unter Grenzkosten',
      className: 'bg-red-50 border-red-300 text-red-800',
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CalculationInput>({
    shouldUnregister: true,
    defaultValues,
  });

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await fetch('/api/history', { method: 'GET' });
      if (response.status === 401) {
        setHistoryItems([]);
        setHistorySummary(null);
        return;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? 'Historie konnte nicht geladen werden');
      }

      const body = await response.json();
      setIsAuthenticated(true);
      setHistoryItems(body.items ?? []);
      setHistorySummary(body.summary ?? null);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Historie konnte nicht geladen werden');
    } finally {
      setHistoryLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session', { method: 'GET' });
      if (!response.ok) {
        setIsAuthenticated(false);
        return false;
      }

      const body = await response.json() as { authenticated?: boolean };
      const authenticated = body.authenticated === true;
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuthAndHistory = async () => {
      const authenticated = await checkSession();
      if (authenticated) {
        await loadHistory();
      }
    };

    void initializeAuthAndHistory();
  }, []);

  const restoreCalculation = (item: CalculationHistoryItem) => {
    const savedInput = item.calculation_input;
    const useManualMode = typeof savedInput.machineHourlyRate === 'number';

    setHourlyRateMode(useManualMode ? 'manual' : 'estimate');
    reset({
      ...defaultValues,
      ...savedInput,
      machineHourlyRate: useManualMode ? savedInput.machineHourlyRate : undefined,
    });
    setResult(item.calculation_result);
    setError(null);
  };

  const deleteCalculation = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? 'Eintrag konnte nicht gelöscht werden');
      }

      await loadHistory();
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Eintrag konnte nicht gelöscht werden');
    }
  };

  const formatSignalIcon = (signal: CalculationResult['pricingSignal']) => {
    if (signal === 'green') {
      return '🟢';
    }

    if (signal === 'yellow') {
      return '🟡';
    }

    return '🔴';
  };

  const onSubmit = async (data: CalculationInput) => {
    if (isAuthenticated === false && freeCalculationUsed) {
      router.push(`/login?next=${encodeURIComponent('/tool')}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: CalculationInput = {
        freeMachineHours: data.freeMachineHours,
        dueDate: data.dueDate,
        offerPrice: data.offerPrice,
        materialCost: data.materialCost,
        machiningTime: data.machiningTime,
        setupTime: data.setupTime,
      };

      if (hourlyRateMode === 'manual') {
        payload.machineHourlyRate = data.machineHourlyRate;
      } else {
        payload.machinePrice = data.machinePrice;
        payload.depreciationYears = data.depreciationYears;
        payload.operatorSalary = data.operatorSalary;
        payload.productiveHoursPerYear = data.productiveHoursPerYear;
      }

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent('/tool')}`);
        return;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.message ?? 'Berechnung fehlgeschlagen';
        throw new Error(message);
      }

      const responseBody = await response.json() as CalculationResult & {
        requiresLoginForNextCalculation?: boolean;
      };
      setResult(responseBody);

      if (responseBody.requiresLoginForNextCalculation) {
        setFreeCalculationUsed(true);
      }

      if (isAuthenticated) {
        await loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.1fr_1.1fr] lg:gap-6 xl:gap-8 lg:items-start">
        <div className="lg:min-w-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auftrag muss fertig sein bis *
          </label>
          <input
            type="date"
            {...register('dueDate', {
              required: 'Erforderlich',
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.dueDate && (
            <p className="text-red-600 text-sm mt-1">{errors.dueDate.message}</p>
          )}
        </div>
                
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Freie Maschinenstunden pro Woche (h) *
          </label>
          <input
            type="number"
            step="0.1"
            {...register('freeMachineHours', {
              required: 'Erforderlich',
              valueAsNumber: true,
              min: { value: 0, message: 'Muss ≥ 0 sein' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.freeMachineHours && (
            <p className="text-red-600 text-sm mt-1">{errors.freeMachineHours.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wie möchten Sie den Maschinenstundensatz bestimmen?
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="hourlyRateMode"
                value="manual"
                checked={hourlyRateMode === 'manual'}
                onChange={() => setHourlyRateMode('manual')}
              />
              Maschinenstundensatz eingeben
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="hourlyRateMode"
                value="estimate"
                checked={hourlyRateMode === 'estimate'}
                onChange={() => setHourlyRateMode('estimate')}
              />
              Maschinenstundensatz schätzen
            </label>
          </div>
          {hourlyRateMode !== 'estimate' && (
            <p className="text-xs text-gray-500 mt-2">
              Viele Fertigungsbetriebe kennen ihren Maschinenstundensatz nicht exakt. 
              Das Tool kann diesen auf Basis weniger Angaben schätzen.
            </p>
          )}
        </div>

        {hourlyRateMode === 'manual' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maschinenstundensatz (€/h) *
          </label>
          <input
            type="number"
            step="1"
            {...register('machineHourlyRate', {
              required: 'Erforderlich',
              valueAsNumber: true,
              min: { value: 0, message: 'Muss ≥ 0 sein' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.machineHourlyRate && (
            <p className="text-red-600 text-sm mt-1">{errors.machineHourlyRate.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Falls bekannt, können Sie Ihren Maschinenstundensatz direkt eingeben.
          </p>
        </div>
        )}

        {hourlyRateMode === 'estimate' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anschaffungspreis der Maschine (€) *
            </label>
            <input
              type="number"
              step="1"
              {...register('machinePrice', {
                required: 'Erforderlich',
                valueAsNumber: true,
                min: { value: 0, message: 'Muss ≥ 0 sein' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.machinePrice && (
              <p className="text-red-600 text-sm mt-1">{errors.machinePrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Abschreibungsdauer (Jahre) *
            </label>
            <input
              type="number"
              step="1"
              {...register('depreciationYears', {
                required: 'Erforderlich',
                valueAsNumber: true,
                min: { value: 1, message: 'Muss ≥ 1 sein' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.depreciationYears && (
              <p className="text-red-600 text-sm mt-1">{errors.depreciationYears.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährlicher Bruttolohn Bediener (€) *
            </label>
            <input
              type="number"
              step="1"
              {...register('operatorSalary', {
                required: 'Erforderlich',
                valueAsNumber: true,
                min: { value: 0, message: 'Muss ≥ 0 sein' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.operatorSalary && (
              <p className="text-red-600 text-sm mt-1">{errors.operatorSalary.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Gesamtkosten inkl. Arbeitgeberanteile.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produktive Maschinenstunden pro Jahr (h) *
            </label>
            <input
              type="number"
              step="1"
              {...register('productiveHoursPerYear', {
                required: 'Erforderlich',
                valueAsNumber: true,
                min: { value: 1, message: 'Muss ≥ 1 sein' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.productiveHoursPerYear && (
              <p className="text-red-600 text-sm mt-1">{errors.productiveHoursPerYear.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Typische Werte liegen zwischen 1200 und 1700 Stunden.
            </p>
          </div>
        </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Angebotspreis (€) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('offerPrice', {
              required: 'Erforderlich',
              valueAsNumber: true,
              min: { value: 0, message: 'Muss ≥ 0 sein' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.offerPrice && (
            <p className="text-red-600 text-sm mt-1">{errors.offerPrice.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materialkosten (€) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('materialCost', {
              required: 'Erforderlich',
              valueAsNumber: true,
              min: { value: 0, message: 'Muss ≥ 0 sein' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.materialCost && (
            <p className="text-red-600 text-sm mt-1">{errors.materialCost.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bearbeitungszeit (h) *
          </label>
          <input
            type="number"
            step="0.1"
            {...register('machiningTime', {
              required: 'Erforderlich',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Muss > 0 sein' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.machiningTime && (
            <p className="text-red-600 text-sm mt-1">{errors.machiningTime.message}</p>
          )}

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rüstzeit (h)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('setupTime', {
              setValueAs: (value) => value === '' ? undefined : Number(value),
              min: { value: 0, message: 'Muss ≥ 0 sein' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.setupTime && (
            <p className="text-red-600 text-sm mt-1">{errors.setupTime.message}</p>
          )}

        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Berechnung läuft...' : 'Analyse starten'}
        </button>
          </form>
        </div>

        <div className="lg:min-w-0">
          {result && (
          <div className="mt-8 lg:mt-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analyseergebnis
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Deckungsbeitrag</p>
                <p className="text-2xl font-bold text-cyan-700">
                  €{result.deckungsbeitrag.toLocaleString('de-DE')}
                </p>
              </div>

              <div className={`p-3 border rounded ${signalStyles[result.pricingSignal].className}`}>
                <p className="text-sm">{signalStyles[result.pricingSignal].label}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {result.hourlyRateEstimated ? 'Geschätzter Maschinenstundensatz' : 'Maschinenstundensatz'}
                </p>
                <p className="text-2xl font-bold text-cyan-700">
                  €{result.machineHourlyRate.toLocaleString('de-DE')}/h
                </p>
                {result.hourlyRateEstimated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dieser Wert basiert auf Ihren Eingaben und stellt eine Näherung dar.
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Gesamte Maschinenzeit des Auftrags</p>
                <p className="text-2xl font-bold text-cyan-700">
                  {result.totalMachineTime?.toFixed(2)} Stunden
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verfügbare freie Stunden bis Termin</p>
                <p className="text-2xl font-bold text-cyan-700">
                  {result.availableFreeHoursUntilDue.toLocaleString('de-DE')} Stunden
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Zeitraum bis Termin: {result.weeksUntilDue.toLocaleString('de-DE')} Wochen
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Grenzkostenpreis bis Liefertermin</p>
                <p className="text-2xl font-bold text-cyan-700">
                  €{result.marginalPrice.toLocaleString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Geschätzte Opportunitätskosten pro Jahr</p>
                <p className="text-2xl font-bold text-cyan-700">
                  €{result.opportunityCostYear.toLocaleString('de-DE')}
                </p>
              </div>
              
              {result.contributionPerHour && (
              <div>
                <p className="text-sm text-gray-600">Deckungsbeitrag pro Maschinenstunde</p>
                <p className="text-2xl font-bold text-cyan-700">
                  €{result.contributionPerHour.toLocaleString('de-DE')}
                </p>
              </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Mindestpreis bei aktueller Auslastung</p>
                <p className="text-2xl font-bold text-cyan-700">
                  €{result.minimumPrice.toLocaleString('de-DE')}
                </p>
              </div>

              {result.economicAssessment && (
              <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                <p className="font-medium text-gray-900 mb-2">Wirtschaftliche Bewertung:</p>
                <p className="text-sm text-gray-700">{result.economicAssessment}</p>
              </div>
              )}

              {result.availableFreeHoursUntilDue >= (result.totalMachineTime ?? 0)
                && result.isBelowFullCostPrice && (
              <div className={`mt-4 p-4 rounded border ${
                result.isBelowMarginalPrice
                  ? 'bg-red-50 border-red-200'
                  : 'bg-cyan-50 border-cyan-200'
              }`}>
                <p className="font-medium text-gray-900 mb-2">
                  {result.isBelowMarginalPrice
                    ? 'Preis liegt unter den Grenzkosten'
                    : 'Warum ein Grenzkostenpreis sinnvoll sein kann'}
                </p>
                {result.isBelowMarginalPrice ? (
                  <p className="text-sm text-red-800">
                    Der aktuelle Angebotspreis liegt unter den Grenzkosten bis zum Liefertermin.
                    Empfohlen: Verlangen Sie mindestens den Grenzkostenpreis von
                    {' '}€{result.marginalPrice.toLocaleString('de-DE')}, damit der Auftrag
                    kurzfristig wirtschaftlich bleibt.
                  </p>
                ) : (
                  <p className="text-sm text-gray-700">
                    Wenn bis zum Liefertermin viel freie Maschinenkapazität vorhanden ist, verursacht
                    ein zusätzlicher Auftrag kurzfristig meist nur die variablen Kosten. In dieser
                    Situation kann ein Angebot oberhalb der Grenzkosten, aber unterhalb des
                    Vollkostenpreises sinnvoll sein: Sie verbessern den Deckungsbeitrag, halten die
                    Maschine produktiv und gewinnen ggf. Folgeaufträge.
                  </p>
                )}
              </div>
              )}

              <div className="mt-6 p-4 bg-white rounded border border-gray-200">
                <p className="font-medium text-gray-900 mb-2">Diagnose:</p>
                <ul className="space-y-1">
                  {result.diagnosis.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>


              {result.benchmarkComparison && (
                <BenchmarkComparisonCard
                  title="Benchmark für vergleichbare Aufträge"
                  comparison={result.benchmarkComparison}
                />
              )}

            </div>
          </div>
          </div>
          )}
        </div>

        <div className="lg:min-w-0">
          {isAuthenticated && (
          <div className="mt-8 lg:mt-0 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Ihre gespeicherten Berechnungen</h3>
          <span className="text-xs text-gray-500">Doppelklick lädt die Rechnung</span>
        </div>

        {historyError && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {historyError}
          </div>
        )}

        {historyLoading ? (
          <p className="text-sm text-gray-500">Historie wird geladen...</p>
        ) : historyItems.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine gespeicherten Berechnungen vorhanden.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-100">
              {historyItems.map((item) => (
                <li
                  key={item.id}
                  onDoubleClick={() => restoreCalculation(item)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer"
                  title="Doppelklick zum Laden"
                >
                  <span className="text-lg" aria-hidden="true">
                    {formatSignalIcon(item.pricing_signal)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {new Date(item.created_at).toLocaleString('de-DE')} - DB: €{item.calculation_result.deckungsbeitrag.toLocaleString('de-DE')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Angebot: €{item.calculation_input.offerPrice.toLocaleString('de-DE')} | Mindestpreis: €{item.calculation_result.minimumPrice.toLocaleString('de-DE')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteCalculation(item.id);
                    }}
                    className="shrink-0 rounded-full w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    aria-label="Berechnung löschen"
                    title="Löschen"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {historySummary && (
          <div className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-3">
            <p className="text-sm font-semibold text-indigo-900 mb-1">
              {formatSignalIcon(historySummary.pricingSignal)} Durchschnitt aus {historyItems.length} Berechnungen
            </p>
            <p className="text-xs text-indigo-900/80">
              DB: €{Math.round(historySummary.deckungsbeitrag).toLocaleString('de-DE')} | Mindestpreis: €{Math.round(historySummary.minimumPrice).toLocaleString('de-DE')} | Grenzkostenpreis: €{Math.round(historySummary.marginalPrice).toLocaleString('de-DE')}
            </p>
            <p className="text-xs text-indigo-900/80 mt-1">
              Maschinenstundensatz: €{Math.round(historySummary.machineHourlyRate).toLocaleString('de-DE')}/h | DB pro Stunde: €{Math.round(historySummary.contributionPerHour).toLocaleString('de-DE')}/h | Opportunitätskosten/Jahr: €{Math.round(historySummary.opportunityCostYear).toLocaleString('de-DE')}
            </p>
            {historySummary.benchmarkComparison && (
              <div className="mt-3">
                <BenchmarkComparisonCard
                  title="Benchmark für Ihren Durchschnitt"
                  comparison={historySummary.benchmarkComparison}
                  compact
                />
              </div>
            )}
          </div>
        )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
