import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/session';

const LoginSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(1, 'Passwort erforderlich'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = LoginSchema.parse(body);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, email_verified, password_hash')
      .eq('email', data.email)
      .single();

    // Einheitliche Fehlermeldung um User-Enumeration zu verhindern
    const invalidCredentialsResponse = NextResponse.json(
      { message: 'E-Mail oder Passwort ungültig.' },
      { status: 401 }
    );

    if (error || !user) {
      // Dummy-Vergleich verhindert Timing-Angriffe bei nicht existierenden Usern
      await bcrypt.compare(data.password, '$2a$12$dummyhashtopreventtimingattacksX');
      return invalidCredentialsResponse;
    }

    if (!user.password_hash) {
      return invalidCredentialsResponse;
    }

    const passwordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordValid) {
      return invalidCredentialsResponse;
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { message: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.' },
        { status: 403 }
      );
    }

    const sessionToken = await createSessionToken(user.id, user.email_verified);
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Session-Konfiguration fehlt. Bitte SESSION_SECRET setzen.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        message: 'Login erfolgreich',
        userId: user.id,
      },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validierungsfehler', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Interner Fehler' },
      { status: 500 }
    );
  }
}
