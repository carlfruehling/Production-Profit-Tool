import {
  BenchmarkComparison,
  BenchmarkConfidence,
  BenchmarkDimensions,
  CalculationInput,
  CalculationResult,
} from '@/types/calculation';

type BenchmarkBand = {
  key: string;
  label: string;
  maxExclusive: number;
  multiplier: number;
};

export type BenchmarkProfile = {
  bucket_key: string;
  time_band: string;
  price_band: string;
  hourly_rate_band: string;
  seed_sample_size: number;
  seed_avg_contribution_per_hour: number;
  real_sample_size: number;
  real_avg_contribution_per_hour: number;
  updated_at?: string | null;
};

const TIME_BANDS: BenchmarkBand[] = [
  { key: 'short', label: 'Rüstintensiv', maxExclusive: 1.5, multiplier: 1.18 },
  { key: 'standard', label: 'Kurzserie', maxExclusive: 4, multiplier: 1.03 },
  { key: 'extended', label: 'Mittelserie', maxExclusive: 10, multiplier: 0.94 },
  { key: 'project', label: 'Langlauf', maxExclusive: Number.POSITIVE_INFINITY, multiplier: 0.85 },
];

const PRICE_BANDS: BenchmarkBand[] = [
  { key: 'budget', label: 'Kleinteil-Auftrag', maxExclusive: 1200, multiplier: 0.87 },
  { key: 'core', label: 'Standard-Auftrag', maxExclusive: 4000, multiplier: 1 },
  { key: 'premium', label: 'Komplex-Auftrag', maxExclusive: 12000, multiplier: 1.12 },
  { key: 'enterprise', label: 'Großlos', maxExclusive: Number.POSITIVE_INFINITY, multiplier: 1.23 },
];

const HOURLY_RATE_BANDS: BenchmarkBand[] = [
  { key: 'economy', label: 'Einfacher Satz', maxExclusive: 85, multiplier: 0.85 },
  { key: 'standard', label: 'CNC-Standard', maxExclusive: 135, multiplier: 1 },
  { key: 'advanced', label: 'Präzisionssatz', maxExclusive: 200, multiplier: 1.13 },
  { key: 'specialized', label: 'Spezialbearbeitung', maxExclusive: Number.POSITIVE_INFINITY, multiplier: 1.27 },
];

const DEFAULT_SOURCE_LABEL = 'Adaptiver Benchmark aus realistischen Startdaten und echten Aufträgen';
const MIN_OBSERVED_CONTRIBUTION = 15;
const MAX_OBSERVED_CONTRIBUTION = 420;

function findBand(value: number, bands: BenchmarkBand[]) {
  return bands.find((band) => value < band.maxExclusive) ?? bands[bands.length - 1];
}

function hashToUnitInterval(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function stabilizeObservedContribution(profile: BenchmarkProfile, observedContributionPerHour: number) {
  const currentBenchmark = calculateEffectiveBenchmark(profile).benchmarkContributionPerHour;
  const fallbackCenter = currentBenchmark > 0
    ? currentBenchmark
    : profile.seed_avg_contribution_per_hour > 0
      ? profile.seed_avg_contribution_per_hour
      : 90;
  const lowerBound = Math.max(MIN_OBSERVED_CONTRIBUTION, fallbackCenter * 0.4);
  const upperBound = Math.min(MAX_OBSERVED_CONTRIBUTION, fallbackCenter * 2.4);

  return roundToTwoDecimals(clamp(observedContributionPerHour, lowerBound, upperBound));
}

function buildComparisonFeedback(params: {
  position: BenchmarkComparison['position'];
  percentageDifference: number;
  contextLabel: string;
  confidence: BenchmarkConfidence;
}) {
  const roundedDifference = Math.abs(Math.round(params.percentageDifference));

  let sentence = '';

  if (params.position === 'above') {
    sentence = `${params.contextLabel} liegt aktuell ${roundedDifference} % über dem Branchendurchschnitt vergleichbarer Aufträge.`;
  } else if (params.position === 'below') {
    sentence = `${params.contextLabel} liegt aktuell ${roundedDifference} % unter dem Branchendurchschnitt vergleichbarer Aufträge.`;
  } else {
    sentence = `${params.contextLabel} liegt aktuell in der Nähe des Branchendurchschnitts vergleichbarer Aufträge.`;
  }

  if (params.confidence === 'low') {
    return `${sentence} Die Datenbasis ist noch im Aufbau und dient vorerst als erste Markttendenz.`;
  }

  if (params.confidence === 'medium') {
    return `${sentence} Die Aussage wird mit jeder echten Berechnung stabiler und präziser.`;
  }

  return `${sentence} Die Aussage basiert bereits auf einer belastbaren Vergleichsbasis aus echten Aufträgen.`;
}

export function getComparableMetrics(input: CalculationInput, result: CalculationResult) {
  const totalMachineTime = result.totalMachineTime ?? input.machiningTime + (input.setupTime ?? 0);
  const contributionPerHour = result.contributionPerHour
    ?? (totalMachineTime > 0 ? result.deckungsbeitrag / totalMachineTime : 0);

  return {
    totalMachineTime: roundToTwoDecimals(totalMachineTime),
    contributionPerHour: roundToTwoDecimals(contributionPerHour),
    offerPrice: input.offerPrice,
    machineHourlyRate: result.machineHourlyRate,
  };
}

export function buildBenchmarkDimensions(metrics: {
  totalMachineTime: number;
  offerPrice: number;
  machineHourlyRate: number;
}): BenchmarkDimensions {
  const timeBand = findBand(metrics.totalMachineTime, TIME_BANDS);
  const priceBand = findBand(metrics.offerPrice, PRICE_BANDS);
  const hourlyRateBand = findBand(metrics.machineHourlyRate, HOURLY_RATE_BANDS);

  return {
    key: `${timeBand.key}:${priceBand.key}:${hourlyRateBand.key}`,
    timeBand: timeBand.label,
    priceBand: priceBand.label,
    hourlyRateBand: hourlyRateBand.label,
    label: `${timeBand.label} · ${priceBand.label} · ${hourlyRateBand.label}`,
  };
}

export function createSeedBenchmarkProfile(dimensions: BenchmarkDimensions): BenchmarkProfile {
  const timeBand = TIME_BANDS.find((band) => dimensions.key.startsWith(`${band.key}:`)) ?? TIME_BANDS[0];
  const [, priceKey = '', hourlyKey = ''] = dimensions.key.split(':');
  const priceBand = PRICE_BANDS.find((band) => band.key === priceKey) ?? PRICE_BANDS[0];
  const hourlyRateBand = HOURLY_RATE_BANDS.find((band) => band.key === hourlyKey) ?? HOURLY_RATE_BANDS[0];
  const base = 94;
  const randomFactor = 0.93 + (hashToUnitInterval(dimensions.key) * 0.14);
  const sampleSize = 28 + Math.round(hashToUnitInterval(`${dimensions.key}:size`) * 42);
  const seedAverage = clamp(
    base * timeBand.multiplier * priceBand.multiplier * hourlyRateBand.multiplier * randomFactor,
    52,
    235
  );

  return {
    bucket_key: dimensions.key,
    time_band: dimensions.timeBand,
    price_band: dimensions.priceBand,
    hourly_rate_band: dimensions.hourlyRateBand,
    seed_sample_size: sampleSize,
    seed_avg_contribution_per_hour: roundToTwoDecimals(seedAverage),
    real_sample_size: 0,
    real_avg_contribution_per_hour: 0,
  };
}

export function createAllSeedBenchmarkProfiles() {
  const profiles: BenchmarkProfile[] = [];

  for (const timeBand of TIME_BANDS) {
    for (const priceBand of PRICE_BANDS) {
      for (const hourlyRateBand of HOURLY_RATE_BANDS) {
        profiles.push(createSeedBenchmarkProfile({
          key: `${timeBand.key}:${priceBand.key}:${hourlyRateBand.key}`,
          timeBand: timeBand.label,
          priceBand: priceBand.label,
          hourlyRateBand: hourlyRateBand.label,
          label: `${timeBand.label} · ${priceBand.label} · ${hourlyRateBand.label}`,
        }));
      }
    }
  }

  return profiles;
}

export function normalizeBenchmarkProfile(
  row: Partial<BenchmarkProfile> | null | undefined,
  dimensions: BenchmarkDimensions
) {
  if (!row) {
    return createSeedBenchmarkProfile(dimensions);
  }

  return {
    bucket_key: row.bucket_key ?? dimensions.key,
    time_band: row.time_band ?? dimensions.timeBand,
    price_band: row.price_band ?? dimensions.priceBand,
    hourly_rate_band: row.hourly_rate_band ?? dimensions.hourlyRateBand,
    seed_sample_size: Number(row.seed_sample_size ?? 0),
    seed_avg_contribution_per_hour: Number(row.seed_avg_contribution_per_hour ?? 0),
    real_sample_size: Number(row.real_sample_size ?? 0),
    real_avg_contribution_per_hour: Number(row.real_avg_contribution_per_hour ?? 0),
    updated_at: row.updated_at ?? null,
  } satisfies BenchmarkProfile;
}

export function calculateEffectiveBenchmark(profile: BenchmarkProfile) {
  const totalSampleSize = profile.seed_sample_size + profile.real_sample_size;
  const weightedAverage = totalSampleSize > 0
    ? (
      (profile.seed_avg_contribution_per_hour * profile.seed_sample_size)
      + (profile.real_avg_contribution_per_hour * profile.real_sample_size)
    ) / totalSampleSize
    : profile.seed_avg_contribution_per_hour;

  let confidence: BenchmarkConfidence = 'low';

  if (profile.real_sample_size >= 18) {
    confidence = 'high';
  } else if (profile.real_sample_size >= 6) {
    confidence = 'medium';
  }

  return {
    benchmarkContributionPerHour: roundToTwoDecimals(weightedAverage),
    sampleSize: totalSampleSize,
    confidence,
  };
}

export function buildBenchmarkComparison(params: {
  subjectContributionPerHour: number;
  benchmarkContributionPerHour: number;
  sampleSize: number;
  realSampleSize: number;
  seedSampleSize: number;
  confidence: BenchmarkConfidence;
  benchmarkLabel: string;
  dimensions?: BenchmarkDimensions;
  contextLabel?: string;
  sourceLabel?: string;
}): BenchmarkComparison {
  const differencePerHour = params.subjectContributionPerHour - params.benchmarkContributionPerHour;
  const percentageDifference = params.benchmarkContributionPerHour === 0
    ? 0
    : (differencePerHour / params.benchmarkContributionPerHour) * 100;
  const absPercentageDifference = Math.abs(percentageDifference);
  const position: BenchmarkComparison['position'] = absPercentageDifference < 7
    ? 'near'
    : percentageDifference > 0
      ? 'above'
      : 'below';
  const roundedSubjectContribution = roundToTwoDecimals(params.subjectContributionPerHour);
  const roundedBenchmarkContribution = roundToTwoDecimals(params.benchmarkContributionPerHour);
  const roundedDifference = roundToTwoDecimals(differencePerHour);

  return {
    benchmarkLabel: params.benchmarkLabel,
    dimensions: params.dimensions,
    subjectContributionPerHour: roundedSubjectContribution,
    benchmarkContributionPerHour: roundedBenchmarkContribution,
    differencePerHour: roundedDifference,
    percentageDifference: roundToTwoDecimals(percentageDifference),
    position,
    confidence: params.confidence,
    sampleSize: params.sampleSize,
    realSampleSize: params.realSampleSize,
    seedSampleSize: params.seedSampleSize,
    sourceLabel: params.sourceLabel ?? DEFAULT_SOURCE_LABEL,
    feedback: buildComparisonFeedback({
      position,
      percentageDifference,
      contextLabel: params.contextLabel ?? 'Ihr Deckungsbeitrag pro Stunde',
      confidence: params.confidence,
    }),
  };
}

export function buildBenchmarkComparisonFromProfile(params: {
  subjectContributionPerHour: number;
  profile: BenchmarkProfile;
  dimensions: BenchmarkDimensions;
  contextLabel?: string;
  benchmarkLabel?: string;
}) {
  const effectiveBenchmark = calculateEffectiveBenchmark(params.profile);

  return buildBenchmarkComparison({
    subjectContributionPerHour: params.subjectContributionPerHour,
    benchmarkContributionPerHour: effectiveBenchmark.benchmarkContributionPerHour,
    sampleSize: effectiveBenchmark.sampleSize,
    realSampleSize: params.profile.real_sample_size,
    seedSampleSize: params.profile.seed_sample_size,
    confidence: effectiveBenchmark.confidence,
    benchmarkLabel: params.benchmarkLabel ?? params.dimensions.label,
    dimensions: params.dimensions,
    contextLabel: params.contextLabel,
  });
}

export function updateBenchmarkProfileWithObservation(
  profile: BenchmarkProfile,
  observedContributionPerHour: number
) {
  const stabilizedObservedContribution = stabilizeObservedContribution(
    profile,
    observedContributionPerHour
  );
  const nextRealSampleSize = profile.real_sample_size + 1;
  const nextRealAverage = nextRealSampleSize === 1
    ? stabilizedObservedContribution
    : (
      (profile.real_avg_contribution_per_hour * profile.real_sample_size)
      + stabilizedObservedContribution
    ) / nextRealSampleSize;

  return {
    ...profile,
    real_sample_size: nextRealSampleSize,
    real_avg_contribution_per_hour: roundToTwoDecimals(nextRealAverage),
  } satisfies BenchmarkProfile;
}
