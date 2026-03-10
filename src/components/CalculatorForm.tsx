'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { CalculationInput, CalculationResult } from '@/types/calculation';

type HourlyRateMode = 'manual' | 'estimate';

export default function CalculatorForm() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyRateMode, setHourlyRateMode] = useState<HourlyRateMode>('manual');
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const signalStyles: Record<CalculationResult['pricingSignal'], { label: string; className: string }> = {
    green: {
      label: '🟢 Vollkosten gedeckt',
      className: 'bg-green-50 border-green-300 text-green-800',
    },
    yellow: {
      label: '🟡 Über Grenzkosten',
      className: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    },
    red: {
      label: '🔴 Unter Grenzkosten',
      className: 'bg-red-50 border-red-300 text-red-800',
    },
  };

  const { register, handleSubmit, formState: { errors } } = useForm<CalculationInput>({
    shouldUnregister: true,
    defaultValues: {
      freeMachineHours: 40,
      dueDate: defaultDueDate,
      machineHourlyRate: 150,
      machinePrice: undefined,
      depreciationYears: 7,
      operatorSalary: undefined,
      productiveHoursPerYear: 1500,
      offerPrice: 5000,
      materialCost: 2000,
      setupTime: 0,
      machiningTime: 2,
    },
  });

  const onSubmit = async (data: CalculationInput) => {
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

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.message ?? 'Berechnung fehlgeschlagen';
        throw new Error(message);
      }

      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Freie Maschinenstunden pro Woche (Stunden) *
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
          <p className="text-xs text-gray-500 mt-2">
            Viele Fertigungsbetriebe kennen ihren Maschinenstundensatz nicht exakt. Das Tool kann
            diesen auf Basis weniger Angaben schätzen.
          </p>
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
              Produktive Maschinenstunden pro Jahr (Stunden) *
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
            Bearbeitungszeit (Stunden) *
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
            Rüstzeit (Stunden)
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

      {result && (
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analyseergebnis
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Deckungsbeitrag</p>
                <p className="text-2xl font-bold text-blue-600">
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
                <p className="text-2xl font-bold text-indigo-600">
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
                <p className="text-2xl font-bold text-blue-600">
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
              {result.contributionPerHour && (
              <div>
                <p className="text-sm text-gray-600">Deckungsbeitrag pro Maschinenstunde</p>
                <p className="text-2xl font-bold text-purple-600">
                  €{result.contributionPerHour.toLocaleString('de-DE')}
                </p>
              </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Grenzkostenpreis bis Liefertermin</p>
                <p className="text-2xl font-bold text-orange-600">
                  €{result.marginalPrice.toLocaleString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Geschätzte Opportunitätskosten pro Jahr</p>
                <p className="text-2xl font-bold text-red-600">
                  €{result.opportunityCostYear.toLocaleString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mindestpreis bei aktueller Auslastung</p>
                <p className="text-2xl font-bold text-green-600">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
