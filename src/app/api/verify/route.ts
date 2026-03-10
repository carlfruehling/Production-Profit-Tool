import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { message: 'Ungültiger Verificationlink' },
      { status: 400 }
    );
  }

  try {
    // Token als User-ID verwenden
    const { data: verifiedUser, error } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', token)
      .select('id, email_verified')
      .single();

    if (error || !verifiedUser) {
      throw error;
    }

    const sessionToken = await createSessionToken(verifiedUser.id, verifiedUser.email_verified);
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Session-Konfiguration fehlt. Bitte SESSION_SECRET setzen.' },
        { status: 500 }
      );
    }

    const response = NextResponse.redirect(new URL('/verify-success', request.url));
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Verifikation fehlgeschlagen' },
      { status: 500 }
    );
  }
}
