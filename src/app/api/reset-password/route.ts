import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token fehlt'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ResetPasswordSchema.parse(body);

    const tokenHash = createHash('sha256').update(data.token).digest('hex');
    const now = new Date().toISOString();

    // Benutzer anhand des gehashten Tokens und gültiger Ablaufzeit suchen
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('reset_token_hash', tokenHash)
      .gt('reset_token_expires_at', now)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { message: 'Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token_hash: null,
        reset_token_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[reset-password] DB update error:', updateError);
      return NextResponse.json({ message: 'Fehler beim Speichern des Passworts.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Passwort erfolgreich geändert.' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validierungsfehler', details: error.format() },
        { status: 400 }
      );
    }

    console.error('[reset-password] Internal error:', error);
    return NextResponse.json({ message: 'Interner Fehler' }, { status: 500 });
  }
}
