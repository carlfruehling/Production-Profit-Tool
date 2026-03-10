import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash, randomBytes } from 'crypto';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ForgotPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
});

// Einheitliche Antwort – unabhängig davon, ob die E-Mail existiert (verhindert User-Enumeration)
const SUCCESS_RESPONSE = NextResponse.json(
  {
    message:
      'Wenn diese E-Mail-Adresse bei uns registriert ist, erhalten Sie in Kürze eine Nachricht mit einem Link zum Zurücksetzen Ihres Passworts.',
  },
  { status: 200 }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ForgotPasswordSchema.parse(body);

    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', data.email)
      .single();

    if (!user) {
      // Keine Information preisgeben – gleiche Antwort zurückgeben
      return SUCCESS_RESPONSE;
    }

    // Sicheres zufälliges Token generieren
    const plainToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 Stunde

    // Gehashtes Token und Ablaufzeit speichern
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token_hash: tokenHash,
        reset_token_expires_at: expiresAt,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[forgot-password] DB update error:', updateError);
      return SUCCESS_RESPONSE; // Kein Unterschied nach außen sichtbar
    }

    // Passwort-Reset-E-Mail senden
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${plainToken}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@onboarding.resend.dev';

    try {
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: 'Passwort zurücksetzen – Produktions-Profit-Tool',
        html: `
          <h2>Passwort zurücksetzen</h2>
          <p>Hallo ${user.name},</p>
          <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
          <p>Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben. Der Link ist <strong>1 Stunde</strong> gültig:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Passwort zurücksetzen
            </a>
          </p>
          <p style="font-size: 12px; color: #666;">Oder kopieren Sie diesen Link: ${resetUrl}</p>
          <p style="font-size: 12px; color: #666;">Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
          <p style="font-size: 12px; color: #666;">Freundliche Grüße,<br/>Das Produktions-Profit-Tool Team</p>
        `,
      });

      if (emailResult.error) {
        console.error('[forgot-password] Resend error:', emailResult.error);
      }
    } catch (emailError) {
      console.error('[forgot-password] Email send exception:', emailError);
    }

    return SUCCESS_RESPONSE;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validierungsfehler', details: error.format() },
        { status: 400 }
      );
    }

    console.error('[forgot-password] Internal error:', error);
    return NextResponse.json({ message: 'Interner Fehler' }, { status: 500 });
  }
}
