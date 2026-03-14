import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import {
  buildBenchmarkComparisonFromProfile,
  buildBenchmarkDimensions,
  getComparableMetrics,
  updateBenchmarkProfileWithObservation,
} from '@/lib/benchmark';
import { getBenchmarkProfile, persistBenchmarkProfile } from '@/lib/benchmark-store';
import { calculateProductionEconomics } from '@/lib/calculation';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, verifySessionToken } from '@/lib/session';

const GUEST_CALC_COOKIE_NAME = 'ppt_guest_calc_used';

const CalculationSchema = z.object({
  freeMachineHours: z.number().min(0),
  dueDate: z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Ungültiges Fertigstellungsdatum',
  }),
  machineHourlyRate: z.number().min(0).optional(),
  machinePrice: z.number().min(0).optional(),
  depreciationYears: z.number().min(0.01).optional(),
  operatorSalary: z.number().min(0).optional(),
  productiveHoursPerYear: z.number().min(0.01).optional(),
  offerPrice: z.number().min(0),
  materialCost: z.number().min(0),
  machiningTime: z.number().min(0.01),
  setupTime: z.number().min(0).optional(),
}).superRefine((data, ctx) => {
  if (typeof data.machineHourlyRate === 'number') {
    return;
  }

  if (typeof data.machinePrice !== 'number') {
    ctx.addIssue({
      path: ['machinePrice'],
      code: z.ZodIssueCode.custom,
      message: 'Erforderlich, wenn kein Maschinenstundensatz angegeben ist',
    });
  }

  if (typeof data.depreciationYears !== 'number') {
    ctx.addIssue({
      path: ['depreciationYears'],
      code: z.ZodIssueCode.custom,
      message: 'Erforderlich, wenn kein Maschinenstundensatz angegeben ist',
    });
  }

  if (typeof data.operatorSalary !== 'number') {
    ctx.addIssue({
      path: ['operatorSalary'],
      code: z.ZodIssueCode.custom,
      message: 'Erforderlich, wenn kein Maschinenstundensatz angegeben ist',
    });
  }

  if (typeof data.productiveHoursPerYear !== 'number') {
    ctx.addIssue({
      path: ['productiveHoursPerYear'],
      code: z.ZodIssueCode.custom,
      message: 'Erforderlich, wenn kein Maschinenstundensatz angegeben ist',
    });
  }
});

type UserContext = {
  userId?: string;
};

function buildUserHash(params: {
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const parts = [
    params.userId?.trim(),
    params.ip?.trim(),
    params.userAgent?.trim(),
  ].filter(Boolean) as string[];

  if (parts.length === 0) {
    return null;
  }

  const salt = process.env.LOG_HASH_SALT ?? '';
  const raw = `${salt}|${parts.join('|')}`;
  return createHash('sha256').update(raw).digest('hex');
}

export async function POST(request: NextRequest) {
  const calculationId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  let userHash: string | null = null;

  try {
    const body = await request.json() as Record<string, unknown>;
    const userContext = (body.userContext ?? {}) as UserContext;
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);
    const hasVerifiedSession = !!session?.emailVerified;
    const guestCalcAlreadyUsed = request.cookies.get(GUEST_CALC_COOKIE_NAME)?.value === '1';

    if (!hasVerifiedSession && guestCalcAlreadyUsed) {
      return NextResponse.json(
        { message: 'Nicht autorisiert. Bitte einloggen und E-Mail bestätigen.' },
        { status: 401 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;
    userHash = buildUserHash({
      userId: session?.userId || userContext.userId,
      ip,
      userAgent,
    });

    const input = CalculationSchema.parse(body);

    console.info('[calculate] Request received', {
      calculationId,
      timestamp,
      userHash,
      payload: input,
    });

    const result = calculateProductionEconomics(input);
    const comparableMetrics = getComparableMetrics(input, result);
    const benchmarkDimensions = buildBenchmarkDimensions(comparableMetrics);
    const benchmarkProfile = await getBenchmarkProfile(benchmarkDimensions);
    const benchmarkComparison = buildBenchmarkComparisonFromProfile({
      subjectContributionPerHour: comparableMetrics.contributionPerHour,
      profile: benchmarkProfile,
      dimensions: benchmarkDimensions,
    });
    const resultWithBenchmark = {
      ...result,
      totalMachineTime: comparableMetrics.totalMachineTime,
      contributionPerHour: comparableMetrics.contributionPerHour,
      benchmarkComparison,
    };

    // History persistence is best-effort: calculation result should still return
    // even when the history table has not been created yet.
    if (hasVerifiedSession && session?.userId) {
      const { error: historyInsertError } = await supabase
        .from('calculation_history')
        .insert([
          {
            user_id: session.userId,
            calculation_input: input,
            calculation_result: resultWithBenchmark,
            pricing_signal: resultWithBenchmark.pricingSignal,
          },
        ]);

      if (historyInsertError) {
        console.warn('[calculate] History insert skipped', {
          calculationId,
          userHash,
          error: historyInsertError,
        });
      }
    }

    console.info('[calculate] Calculation completed', {
      calculationId,
      timestamp,
      userHash,
      result: resultWithBenchmark,
    });

    const responseBody = hasVerifiedSession
      ? resultWithBenchmark
      : {
        ...resultWithBenchmark,
        requiresLoginForNextCalculation: true,
      };

    const updatedBenchmarkProfile = updateBenchmarkProfileWithObservation(
      benchmarkProfile,
      comparableMetrics.contributionPerHour
    );
    await persistBenchmarkProfile(updatedBenchmarkProfile);

    const response = NextResponse.json(responseBody, { status: 200 });

    if (!hasVerifiedSession) {
      response.cookies.set(GUEST_CALC_COOKIE_NAME, '1', {
        ...SESSION_COOKIE_OPTIONS,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('[calculate] Validation failed', {
        calculationId,
        timestamp,
        userHash,
        issues: error.issues,
      });

      return NextResponse.json(
        { message: 'Validierungsfehler', details: error.format() },
        { status: 400 }
      );
    }

    console.error('[calculate] Internal error', {
      calculationId,
      timestamp,
      userHash,
      error,
    });

    return NextResponse.json(
      { message: 'Interner Fehler' },
      { status: 500 }
    );
  }
}
