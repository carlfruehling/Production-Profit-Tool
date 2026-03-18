import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const ANALYTICS_EVENTS_TABLE = 'analytics_events';

export const ANALYTICS_EVENT_TYPES = [
  'page_view',
  'tool_calculation_completed',
  'account_registered',
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

type AnalyticsEventRow = {
  id: string;
  event_type: AnalyticsEventType;
  visitor_hash: string | null;
  user_id: string | null;
  path: string | null;
  created_at: string;
};

type AnalyticsDailyBucket = {
  date: string;
  visitors: number;
  toolTesters: number;
  accountCreators: number;
};

let analyticsTableAvailable: boolean | null = null;

function isMissingAnalyticsTableError(error: { code?: string | null; message?: string | null }) {
  return error.code === 'PGRST205' || error.code === '42P01';
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) {
    return undefined;
  }

  return forwardedFor.split(',')[0]?.trim() || undefined;
}

function buildVisitorHash(params: { ip?: string; userAgent?: string }) {
  const parts = [params.ip?.trim(), params.userAgent?.trim()].filter(Boolean) as string[];

  if (parts.length === 0) {
    return null;
  }

  const salt = process.env.ANALYTICS_HASH_SALT?.trim() || process.env.LOG_HASH_SALT?.trim() || '';
  return createHash('sha256').update(`${salt}|${parts.join('|')}`).digest('hex');
}

function getActorKey(row: Pick<AnalyticsEventRow, 'id' | 'visitor_hash' | 'user_id'>) {
  return row.visitor_hash || row.user_id || row.id;
}

function buildDailySeries(rows: AnalyticsEventRow[], startDate: Date, endDate: Date) {
  const buckets = new Map<string, {
    visitors: Set<string>;
    toolTesters: Set<string>;
    accountCreators: Set<string>;
  }>();

  const cursor = new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  ));
  const endCursor = new Date(Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  ));

  while (cursor <= endCursor) {
    const key = cursor.toISOString().slice(0, 10);
    buckets.set(key, {
      visitors: new Set<string>(),
      toolTesters: new Set<string>(),
      accountCreators: new Set<string>(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    const bucket = buckets.get(day);
    if (!bucket) {
      continue;
    }

    const actorKey = getActorKey(row);

    if (row.event_type === 'page_view') {
      bucket.visitors.add(actorKey);
      continue;
    }

    if (row.event_type === 'tool_calculation_completed') {
      bucket.toolTesters.add(actorKey);
      continue;
    }

    if (row.event_type === 'account_registered') {
      bucket.accountCreators.add(actorKey);
    }
  }

  return Array.from(buckets.entries()).map(([date, bucket]) => ({
    date,
    visitors: bucket.visitors.size,
    toolTesters: bucket.toolTesters.size,
    accountCreators: bucket.accountCreators.size,
  })) satisfies AnalyticsDailyBucket[];
}

export async function ensureAnalyticsEventsTable() {
  if (analyticsTableAvailable === false) {
    return false;
  }

  const { error } = await supabase
    .from(ANALYTICS_EVENTS_TABLE)
    .select('id', { head: true, count: 'exact' });

  if (error) {
    if (isMissingAnalyticsTableError(error)) {
      analyticsTableAvailable = false;
      return false;
    }

    throw error;
  }

  analyticsTableAvailable = true;
  return true;
}

export async function trackAnalyticsEvent(params: {
  request: NextRequest;
  eventType: AnalyticsEventType;
  path?: string | null;
  userId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const analyticsReady = await ensureAnalyticsEventsTable().catch((error) => {
    console.warn('[analytics] Table check failed', error);
    return false;
  });

  if (!analyticsReady) {
    return false;
  }

  const visitorHash = buildVisitorHash({
    ip: getClientIp(params.request),
    userAgent: params.request.headers.get('user-agent') ?? undefined,
  });

  const { error } = await supabase
    .from(ANALYTICS_EVENTS_TABLE)
    .insert([
      {
        event_type: params.eventType,
        visitor_hash: visitorHash,
        user_id: params.userId ?? null,
        path: params.path ?? null,
        metadata: params.metadata ?? {},
      },
    ]);

  if (error) {
    if (isMissingAnalyticsTableError(error)) {
      analyticsTableAvailable = false;
    }

    console.warn('[analytics] Event insert skipped', {
      eventType: params.eventType,
      error,
    });
    return false;
  }

  return true;
}

export async function getAnalyticsSummary(days: number) {
  const analyticsReady = await ensureAnalyticsEventsTable().catch((error) => {
    console.warn('[analytics] Table check failed', error);
    return false;
  });

  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(365, Math.floor(days))) : 30;
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date();

  if (!analyticsReady) {
    return {
      configured: false,
      windowDays: safeDays,
      totals: {
        uniqueVisitors: 0,
        toolTesters: 0,
        accountCreators: 0,
        pageViews: 0,
        toolCompletions: 0,
        accountRegistrations: 0,
      },
      conversions: {
        visitorToToolRate: 0,
        visitorToRegistrationRate: 0,
        toolToRegistrationRate: 0,
      },
      daily: [] as AnalyticsDailyBucket[],
      recentEvents: [] as AnalyticsEventRow[],
    };
  }

  const { data, error } = await supabase
    .from(ANALYTICS_EVENTS_TABLE)
    .select('id, event_type, visitor_hash, user_id, path, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as AnalyticsEventRow[];
  const visitorSet = new Set<string>();
  const toolTesterSet = new Set<string>();
  const accountCreatorSet = new Set<string>();
  let pageViews = 0;
  let toolCompletions = 0;
  let accountRegistrations = 0;

  for (const row of rows) {
    const actorKey = getActorKey(row);

    if (row.event_type === 'page_view') {
      pageViews += 1;
      visitorSet.add(actorKey);
      continue;
    }

    if (row.event_type === 'tool_calculation_completed') {
      toolCompletions += 1;
      toolTesterSet.add(actorKey);
      continue;
    }

    if (row.event_type === 'account_registered') {
      accountRegistrations += 1;
      accountCreatorSet.add(row.user_id || actorKey);
    }
  }

  const uniqueVisitors = visitorSet.size;
  const toolTesters = toolTesterSet.size;
  const accountCreators = accountCreatorSet.size;
  const toPercent = (value: number) => Math.round(value * 1000) / 10;

  return {
    configured: true,
    windowDays: safeDays,
    totals: {
      uniqueVisitors,
      toolTesters,
      accountCreators,
      pageViews,
      toolCompletions,
      accountRegistrations,
    },
    conversions: {
      visitorToToolRate: uniqueVisitors > 0 ? toPercent(toolTesters / uniqueVisitors) : 0,
      visitorToRegistrationRate: uniqueVisitors > 0 ? toPercent(accountCreators / uniqueVisitors) : 0,
      toolToRegistrationRate: toolTesters > 0 ? toPercent(accountCreators / toolTesters) : 0,
    },
    daily: buildDailySeries(rows, startDate, endDate),
    recentEvents: rows.slice(0, 20),
  };
}