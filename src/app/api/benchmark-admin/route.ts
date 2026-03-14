import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getBenchmarkAdminStats,
  reseedBenchmarkProfiles,
  resetBenchmarkRealData,
} from '@/lib/benchmark-store';

const BenchmarkAdminActionSchema = z.object({
  action: z.enum(['reseed-all', 'reset-real-data']),
});

function readAdminToken(request: NextRequest) {
  const headerToken = request.headers.get('x-admin-token')?.trim();
  if (headerToken) {
    return headerToken;
  }

  const authorization = request.headers.get('authorization')?.trim();
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return null;
}

function isAuthorized(request: NextRequest) {
  const expectedToken = process.env.BENCHMARK_ADMIN_TOKEN?.trim();

  if (!expectedToken) {
    return { ok: false, status: 503, message: 'BENCHMARK_ADMIN_TOKEN ist nicht konfiguriert.' };
  }

  const receivedToken = readAdminToken(request);

  if (!receivedToken || receivedToken !== expectedToken) {
    return { ok: false, status: 401, message: 'Nicht autorisiert.' };
  }

  return { ok: true as const };
}

export async function GET(request: NextRequest) {
  const authorization = isAuthorized(request);
  if (!authorization.ok) {
    return NextResponse.json({ message: authorization.message }, { status: authorization.status });
  }

  try {
    const stats = await getBenchmarkAdminStats();
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('[benchmark-admin] GET error', error);
    return NextResponse.json({ message: 'Benchmark-Statistiken konnten nicht geladen werden.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorization = isAuthorized(request);
  if (!authorization.ok) {
    return NextResponse.json({ message: authorization.message }, { status: authorization.status });
  }

  try {
    const body = await request.json();
    const { action } = BenchmarkAdminActionSchema.parse(body);

    if (action === 'reseed-all') {
      const result = await reseedBenchmarkProfiles();
      return NextResponse.json({
        message: 'Benchmark-Profile wurden vollständig auf Seed-Daten zurückgesetzt.',
        result,
      }, { status: 200 });
    }

    const result = await resetBenchmarkRealData();
    return NextResponse.json({
      message: 'Echte Benchmark-Daten wurden entfernt, Seed-Daten bleiben erhalten.',
      result,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ungültige Admin-Aktion.' }, { status: 400 });
    }

    console.error('[benchmark-admin] POST error', error);
    return NextResponse.json({ message: 'Benchmark-Admin-Aktion fehlgeschlagen.' }, { status: 500 });
  }
}
