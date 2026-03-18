import { NextRequest, NextResponse } from 'next/server';
import { authorizeAdminRequest } from '@/lib/admin-auth';
import { getAnalyticsSummary } from '@/lib/analytics';
import { getGuestCalculationSummary } from '@/lib/guest-history';

export async function GET(request: NextRequest) {
  const authorization = authorizeAdminRequest(request, {
    envKeys: ['ANALYTICS_ADMIN_TOKEN', 'BENCHMARK_ADMIN_TOKEN'],
  });

  if (!authorization.ok) {
    return NextResponse.json({ message: authorization.message }, { status: authorization.status });
  }

  try {
    const requestedDays = Number(request.nextUrl.searchParams.get('days') ?? '30');
    const [summary, guestHistory] = await Promise.all([
      getAnalyticsSummary(requestedDays),
      getGuestCalculationSummary(requestedDays),
    ]);

    return NextResponse.json({
      ...summary,
      guestHistory,
    }, { status: 200 });
  } catch (error) {
    console.error('[analytics-admin] GET error', error);
    return NextResponse.json({ message: 'Analytics konnten nicht geladen werden.' }, { status: 500 });
  }
}