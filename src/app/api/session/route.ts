import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    if (!session?.emailVerified) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        userId: session.userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[session] GET error', error);
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 200 }
    );
  }
}
