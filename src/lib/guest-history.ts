import { CalculationInput, CalculationResult, GuestCalculationHistoryItem } from '@/types/calculation';
import { supabase } from '@/lib/supabase';

const GUEST_HISTORY_TABLE = 'guest_calculation_history';

let guestHistoryTableAvailable: boolean | null = null;

function isMissingGuestTableError(error: { code?: string | null }) {
  return error.code === 'PGRST205' || error.code === '42P01';
}

export async function ensureGuestHistoryTable() {
  if (guestHistoryTableAvailable === false) {
    return false;
  }

  const { error } = await supabase
    .from(GUEST_HISTORY_TABLE)
    .select('id', { head: true, count: 'exact' });

  if (error) {
    if (isMissingGuestTableError(error)) {
      guestHistoryTableAvailable = false;
      return false;
    }

    throw error;
  }

  guestHistoryTableAvailable = true;
  return true;
}

export async function persistGuestCalculation(params: {
  visitorHash: string | null;
  input: CalculationInput;
  result: CalculationResult;
}) {
  const guestHistoryReady = await ensureGuestHistoryTable().catch((error) => {
    console.warn('[guest-history] Table check failed', error);
    return false;
  });

  if (!guestHistoryReady) {
    return false;
  }

  const { error } = await supabase
    .from(GUEST_HISTORY_TABLE)
    .insert([
      {
        visitor_hash: params.visitorHash,
        calculation_input: params.input,
        calculation_result: params.result,
        pricing_signal: params.result.pricingSignal,
      },
    ]);

  if (error) {
    if (isMissingGuestTableError(error)) {
      guestHistoryTableAvailable = false;
    }

    console.warn('[guest-history] Insert skipped', error);
    return false;
  }

  return true;
}

export async function getGuestCalculationSummary(days: number) {
  const guestHistoryReady = await ensureGuestHistoryTable().catch((error) => {
    console.warn('[guest-history] Table check failed', error);
    return false;
  });

  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(365, Math.floor(days))) : 30;
  if (!guestHistoryReady) {
    return {
      configured: false,
      windowDays: safeDays,
      totals: {
        guestCalculations: 0,
        uniqueGuestVisitors: 0,
      },
      recentItems: [] as GuestCalculationHistoryItem[],
    };
  }

  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from(GUEST_HISTORY_TABLE)
    .select('id, visitor_hash, calculation_input, calculation_result, pricing_signal, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as GuestCalculationHistoryItem[];
  const uniqueVisitorSet = new Set(
    rows
      .map((row) => row.visitor_hash)
      .filter((visitorHash): visitorHash is string => typeof visitorHash === 'string' && visitorHash.length > 0)
  );

  return {
    configured: true,
    windowDays: safeDays,
    totals: {
      guestCalculations: rows.length,
      uniqueGuestVisitors: uniqueVisitorSet.size,
    },
    recentItems: rows.slice(0, 20),
  };
}