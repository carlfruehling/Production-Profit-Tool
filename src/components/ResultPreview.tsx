'use client';

import Link from 'next/link';
import { CalculationResult } from '@/types/calculation';

interface ResultPreviewProps {
  result: CalculationResult;
}

export default function ResultPreview({ result }: ResultPreviewProps) {
  const minCost = Math.round(result.opportunityCostYear * 0.7);
  const maxCost = Math.round(result.opportunityCostYear * 1.3);

  return (
    <div className="w-full max-w-md mx-auto bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        ⚠️ Ihre Chancen warten
      </h3>

      <div className="bg-white rounded p-4 mb-4 border border-yellow-200">
        <p className="text-sm text-gray-600 mb-2">
          Geschätzter EBIT-Verlust durch ungenutzte Maschinenkapazität:
        </p>
        <p className="text-2xl font-bold text-red-600">
          €{minCost.toLocaleString('de-DE')} – €{maxCost.toLocaleString('de-DE')}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Pro Jahr bei {result.diagnosis.length > 0 ? 'aktuellen' : 'den'} Betriebsbedingungen
        </p>
      </div>

      <div className="bg-white rounded p-4 mb-4 border border-indigo-200">
        <p className="text-sm text-gray-600 mb-2">
          {result.hourlyRateEstimated ? 'Geschätzter Maschinenstundensatz' : 'Maschinenstundensatz'}
        </p>
        <p className="text-2xl font-bold text-indigo-600">
          Ihr {result.hourlyRateEstimated ? 'geschätzter ' : ''}Maschinenstundensatz beträgt etwa
          {' '}€{result.machineHourlyRate.toLocaleString('de-DE')}/h.
        </p>
        {result.hourlyRateEstimated && (
          <p className="text-xs text-gray-500 mt-2">
            Dieser Wert basiert auf Ihren Eingaben und stellt eine Näherung dar.
          </p>
        )}
      </div>

      {result.totalMachineTime && (
      <div className="bg-white rounded p-4 mb-4 border border-blue-200">
        <p className="text-sm text-gray-600 mb-2">
          Maschinenzeit des Auftrags
        </p>
        <p className="text-2xl font-bold text-blue-600">
          {result.totalMachineTime.toFixed(2)} Stunden
        </p>
      </div>
      )}

      {result.contributionPerHour && (
      <div className="bg-white rounded p-4 mb-4 border border-purple-200">
        <p className="text-sm text-gray-600 mb-2">
          Deckungsbeitrag pro Maschinenstunde
        </p>
        <p className="text-2xl font-bold text-purple-600">
          €{result.contributionPerHour.toLocaleString('de-DE')}/h
        </p>
      </div>
      )}

      <p className="text-sm text-gray-700 mb-6">
        Registrieren Sie sich, um Ihre vollständige Analyse inkl. Handlungsempfehlungen zu erhalten.
      </p>

      <Link
        href="/register"
        className="block w-full bg-blue-600 text-white py-3 rounded-md font-semibold text-center hover:bg-blue-700 transition-colors"
      >
        Vollständige Analyse freischalten
      </Link>

      <p className="text-xs text-gray-500 text-center mt-4">
        Kostenlos • 60 Sekunden • Keine Verpflichtung
      </p>
    </div>
  );
}
