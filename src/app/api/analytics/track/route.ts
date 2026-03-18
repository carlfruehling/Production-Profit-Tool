import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { trackAnalyticsEvent } from '@/lib/analytics';

const TrackPageViewSchema = z.object({
  path: z.string().trim().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = TrackPageViewSchema.parse(body);

    await trackAnalyticsEvent({
      request,
      eventType: 'page_view',
      path,
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ungültiger Tracking-Request.' }, { status: 400 });
    }

    console.error('[analytics] Track route error', error);
    return NextResponse.json({ message: 'Tracking fehlgeschlagen.' }, { status: 500 });
  }
}