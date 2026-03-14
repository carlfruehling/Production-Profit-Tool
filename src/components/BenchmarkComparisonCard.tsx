import { BenchmarkComparison } from '@/types/calculation';

type BenchmarkComparisonCardProps = {
  title: string;
  comparison: BenchmarkComparison;
  compact?: boolean;
};

const positionStyles: Record<BenchmarkComparison['position'], { badge: string; tone: string; label: string }> = {
  above: {
    badge: 'bg-green-100 text-green-800 border border-green-200',
    tone: 'bg-green-50 border-green-200',
    label: 'Über Benchmark',
  },
  below: {
    badge: 'bg-red-100 text-red-800 border border-red-200',
    tone: 'bg-red-50 border-red-200',
    label: 'Unter Benchmark',
  },
  near: {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    tone: 'bg-amber-50 border-amber-200',
    label: 'Nahe am Benchmark',
  },
};

const confidenceLabels: Record<BenchmarkComparison['confidence'], string> = {
  low: 'frühe Tendenz',
  medium: 'lernender Vergleich',
  high: 'belastbare Datenbasis',
};

export default function BenchmarkComparisonCard({
  title,
  comparison,
  compact = false,
}: BenchmarkComparisonCardProps) {
  const styles = positionStyles[comparison.position];
  const absolutePercentage = Math.abs(Math.round(comparison.percentageDifference));
  const indicatorPosition = Math.max(8, Math.min(92, 50 + comparison.percentageDifference));
  const impactLabel = comparison.position === 'above'
    ? 'besser als Vergleichsmarkt'
    : comparison.position === 'below'
      ? 'unter Vergleichsmarkt'
      : 'nahe am Vergleichsmarkt';
  const signedDifference = comparison.differencePerHour >= 0
    ? `+€${comparison.differencePerHour.toLocaleString('de-DE')}`
    : `-€${Math.abs(comparison.differencePerHour).toLocaleString('de-DE')}`;

  return (
    <div className={`rounded-lg border p-4 ${styles.tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{comparison.sourceLabel}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-white/70 bg-white/80 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Benchmark-Signal</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {comparison.differencePerHour >= 0 ? '+' : '-'}{absolutePercentage}%
            </p>
            <p className="text-sm text-gray-600 mt-1">{impactLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Marktniveau</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              €{comparison.benchmarkContributionPerHour.toLocaleString('de-DE')}/h
            </p>
            <p className="text-xs text-gray-500 mt-1">{signedDifference} pro Stunde</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>unter Markt</span>
            <span>Marktfenster</span>
            <span>über Markt</span>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-gray-200">
            <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400" />
            <div
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow ${comparison.position === 'above' ? 'bg-green-500' : comparison.position === 'below' ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ left: `calc(${indicatorPosition}% - 8px)` }}
            />
          </div>
        </div>
      </div>

      <div className={`grid gap-3 ${compact ? 'mt-3 sm:grid-cols-2' : 'mt-4 sm:grid-cols-3'}`}>
        <div className="rounded-md bg-white/80 p-3 border border-white/70">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ihr Wert</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            €{comparison.subjectContributionPerHour.toLocaleString('de-DE')}/h
          </p>
        </div>
        <div className="rounded-md bg-white/80 p-3 border border-white/70">
          <p className="text-xs uppercase tracking-wide text-gray-500">Benchmark</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            €{comparison.benchmarkContributionPerHour.toLocaleString('de-DE')}/h
          </p>
        </div>
        <div className="rounded-md bg-white/80 p-3 border border-white/70">
          <p className="text-xs uppercase tracking-wide text-gray-500">Abweichung</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {comparison.differencePerHour >= 0 ? '+' : '-'}{absolutePercentage}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{signedDifference} pro Stunde</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700">{comparison.feedback}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span>{comparison.benchmarkLabel}</span>
        <span>Datenbasis: {comparison.sampleSize} Vergleichswerte</span>
        <span>Echte Aufträge: {comparison.realSampleSize} • Seeds: {comparison.seedSampleSize}</span>
        <span>Status: {confidenceLabels[comparison.confidence]}</span>
      </div>
    </div>
  );
}