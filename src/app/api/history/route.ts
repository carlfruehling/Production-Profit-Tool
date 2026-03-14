import { NextRequest, NextResponse } from 'next/server';
import {
  buildBenchmarkComparison,
  buildBenchmarkComparisonFromProfile,
  buildBenchmarkDimensions,
  getComparableMetrics,
} from '@/lib/benchmark';
import { getBenchmarkProfiles } from '@/lib/benchmark-store';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { CalculationHistoryItem, CalculationHistorySummary, CalculationResult } from '@/types/calculation';

function buildAveragePricingSignal(items: CalculationHistoryItem[]) {
  let signalScore = 0;

  for (const item of items) {
    if (item.calculation_result.pricingSignal === 'green') {
      signalScore += 2;
    } else if (item.calculation_result.pricingSignal === 'yellow') {
      signalScore += 1;
    }
  }

  const avgSignal = signalScore / items.length;

  if (avgSignal >= 1.5) {
    return 'green';
  }

  if (avgSignal >= 0.75) {
    return 'yellow';
  }

  return 'red';
}

function averageConfidence(items: Array<CalculationResult['benchmarkComparison']>) {
  const confidenceScore = items.reduce((total, comparison) => {
    if (!comparison) {
      return total;
    }

    if (comparison.confidence === 'high') {
      return total + 2;
    }

    if (comparison.confidence === 'medium') {
      return total + 1;
    }

    return total;
  }, 0);

  const normalized = confidenceScore / Math.max(items.length, 1);

  if (normalized >= 1.5) {
    return 'high';
  }

  if (normalized >= 0.75) {
    return 'medium';
  }

  return 'low';
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function buildHistorySummary(items: CalculationHistoryItem[]): CalculationHistorySummary | null {
  if (items.length === 0) {
    return null;
  }

  let sumDeckungsbeitrag = 0;
  let sumMarginalPrice = 0;
  let sumMinimumPrice = 0;
  let sumOpportunityCostYear = 0;
  let sumMachineHourlyRate = 0;
  let sumContributionPerHour = 0;
  let sumBenchmarkContributionPerHour = 0;
  let sumBenchmarkSampleSize = 0;
  let sumBenchmarkRealSampleSize = 0;
  let sumBenchmarkSeedSampleSize = 0;

  for (const item of items) {
    const historyResult = item.calculation_result;
    sumDeckungsbeitrag += historyResult.deckungsbeitrag;
    sumMarginalPrice += historyResult.marginalPrice;
    sumMinimumPrice += historyResult.minimumPrice;
    sumOpportunityCostYear += historyResult.opportunityCostYear;
    sumMachineHourlyRate += historyResult.machineHourlyRate;
    sumContributionPerHour += historyResult.contributionPerHour ?? 0;
    sumBenchmarkContributionPerHour += historyResult.benchmarkComparison?.benchmarkContributionPerHour ?? 0;
    sumBenchmarkSampleSize += historyResult.benchmarkComparison?.sampleSize ?? 0;
    sumBenchmarkRealSampleSize += historyResult.benchmarkComparison?.realSampleSize ?? 0;
    sumBenchmarkSeedSampleSize += historyResult.benchmarkComparison?.seedSampleSize ?? 0;
  }

  const benchmarkComparisons = items.map((item) => item.calculation_result.benchmarkComparison);
  const averageContributionPerHour = sumContributionPerHour / items.length;
  const averageBenchmarkContributionPerHour = sumBenchmarkContributionPerHour / items.length;
  const averageBenchmarkSampleSize = Math.round(sumBenchmarkSampleSize / items.length);
  const averageBenchmarkRealSampleSize = Math.round(sumBenchmarkRealSampleSize / items.length);
  const averageBenchmarkSeedSampleSize = Math.round(sumBenchmarkSeedSampleSize / items.length);

  return {
    deckungsbeitrag: roundToTwoDecimals(sumDeckungsbeitrag / items.length),
    marginalPrice: roundToTwoDecimals(sumMarginalPrice / items.length),
    minimumPrice: roundToTwoDecimals(sumMinimumPrice / items.length),
    opportunityCostYear: roundToTwoDecimals(sumOpportunityCostYear / items.length),
    machineHourlyRate: roundToTwoDecimals(sumMachineHourlyRate / items.length),
    contributionPerHour: roundToTwoDecimals(averageContributionPerHour),
    pricingSignal: buildAveragePricingSignal(items),
    benchmarkComparison: buildBenchmarkComparison({
      subjectContributionPerHour: averageContributionPerHour,
      benchmarkContributionPerHour: averageBenchmarkContributionPerHour,
      sampleSize: averageBenchmarkSampleSize,
      realSampleSize: averageBenchmarkRealSampleSize,
      seedSampleSize: averageBenchmarkSeedSampleSize,
      confidence: averageConfidence(benchmarkComparisons),
      benchmarkLabel: `Gewichteter Marktvergleich über ${items.length} Berechnungen`,
      contextLabel: 'Ihr durchschnittlicher Deckungsbeitrag pro Stunde',
    }),
  };
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    if (!session?.emailVerified) {
      return NextResponse.json(
        { message: 'Nicht autorisiert. Bitte einloggen und E-Mail bestätigen.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('calculation_history')
      .select('id, calculation_input, calculation_result, pricing_signal, created_at')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ message: 'Historie konnte nicht geladen werden.' }, { status: 500 });
    }

    const rawItems = (data ?? []) as CalculationHistoryItem[];
    const comparableMetaById = new Map(rawItems.map((item) => {
      const comparableMetrics = getComparableMetrics(item.calculation_input, item.calculation_result);
      const benchmarkDimensions = buildBenchmarkDimensions(comparableMetrics);

      return [item.id, { comparableMetrics, benchmarkDimensions }] as const;
    }));
    const benchmarkProfiles = await getBenchmarkProfiles(
      Array.from(comparableMetaById.values()).map((entry) => entry.benchmarkDimensions)
    );
    const enrichedItems = rawItems.map((item) => {
      const meta = comparableMetaById.get(item.id);

      if (!meta) {
        return item;
      }

      const profile = benchmarkProfiles.get(meta.benchmarkDimensions.key);

      if (!profile) {
        return item;
      }

      const benchmarkComparison = buildBenchmarkComparisonFromProfile({
        subjectContributionPerHour: meta.comparableMetrics.contributionPerHour,
        profile,
        dimensions: meta.benchmarkDimensions,
      });

      return {
        ...item,
        calculation_result: {
          ...item.calculation_result,
          totalMachineTime: meta.comparableMetrics.totalMachineTime,
          contributionPerHour: meta.comparableMetrics.contributionPerHour,
          benchmarkComparison,
        },
      } satisfies CalculationHistoryItem;
    });
    const summary = buildHistorySummary(enrichedItems);

    return NextResponse.json({ items: enrichedItems, summary }, { status: 200 });
  } catch (error) {
    console.error('[history] GET error', error);
    return NextResponse.json({ message: 'Interner Fehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    if (!session?.emailVerified) {
      return NextResponse.json(
        { message: 'Nicht autorisiert. Bitte einloggen und E-Mail bestätigen.' },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'id fehlt' }, { status: 400 });
    }

    const { error } = await supabase
      .from('calculation_history')
      .delete()
      .eq('id', id)
      .eq('user_id', session.userId);

    if (error) {
      return NextResponse.json({ message: 'Eintrag konnte nicht gelöscht werden.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Gelöscht' }, { status: 200 });
  } catch (error) {
    console.error('[history] DELETE error', error);
    return NextResponse.json({ message: 'Interner Fehler' }, { status: 500 });
  }
}
