import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const RegistrationSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  company: z.string().min(1, 'Firma erforderlich'),
  position: z.string().optional(),
  email: z.string().email('Ungültige E-Mail'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  consentData: z.boolean().refine((val) => val === true, 'Zustimmung erforderlich'),
});

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabaseConfigured =
      supabaseUrl.length > 0
      && supabaseKey.length > 0
      && !supabaseUrl.includes('your-project.supabase.co')
      && !supabaseKey.includes('your_service_role_key_here');

    if (!supabaseConfigured) {
      return NextResponse.json(
        {
          message: 'Supabase ist nicht konfiguriert. Bitte prüfen Sie NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local.',
        },
        { status: 500 }
      );
    }

    const looksLikeSupabaseUrl = /https:\/\/.+\.supabase\.co/i.test(supabaseUrl);
    const looksLikeServerKey = supabaseKey.startsWith('eyJ') || supabaseKey.startsWith('sb_secret_');

    if (!looksLikeSupabaseUrl || !looksLikeServerKey) {
      return NextResponse.json(
        {
          message: 'Supabase-Konfiguration in Production ist ungültig. NEXT_PUBLIC_SUPABASE_URL muss auf https://<project-ref>.supabase.co zeigen und SUPABASE_SERVICE_ROLE_KEY muss ein Server-Key sein (service_role JWT oder sb_secret_...).',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const data = RegistrationSchema.parse(body);

    // Prüfe, ob E-Mail bereits existiert
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    if (existingUserError) {
      console.error('Existing user check error:', existingUserError);

      const htmlError = `${existingUserError.message ?? ''} ${existingUserError.details ?? ''}`;
      if (htmlError.includes('<!DOCTYPE html>') || htmlError.includes('This page could not be found')) {
        return NextResponse.json(
          {
            message: 'Supabase antwortet nicht als API (HTML/404). Prüfen Sie in Vercel die Variable NEXT_PUBLIC_SUPABASE_URL; sie muss https://<project-ref>.supabase.co sein und nicht Ihre App-Domain.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: `Benutzerprüfung fehlgeschlagen (${existingUserError.code ?? 'unbekannt'}): ${existingUserError.message ?? 'keine Details'}`,
          details: existingUserError.details ?? null,
          hint: existingUserError.hint ?? null,
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'Diese E-Mail-Adresse bereits registriert' },
        { status: 400 }
      );
    }

    // Passwort hashen (Kostenfaktor 12 ist ein guter Kompromiss aus Sicherheit und Geschwindigkeit)
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Benutzer in Datenbank speichern
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: data.name,
          company: data.company,
          position: data.position || null,
          email: data.email,
          phone: data.phone || null,
          password_hash: passwordHash,
          email_verified: false,
          consent_contact: false,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);

      if (insertError.code === 'PGRST205') {
        return NextResponse.json(
          { message: 'Supabase-Tabelle public.users fehlt. Bitte führen Sie die SQL-Anlage aus SUPABASE_SETUP.md aus.' },
          { status: 500 }
        );
      }

      if (insertError.code === '42P01') {
        return NextResponse.json(
          { message: 'Tabelle public.users fehlt. Bitte SUPABASE_SETUP.md im SQL Editor ausführen.' },
          { status: 500 }
        );
      }

      if (insertError.code === '42703') {
        return NextResponse.json(
          { message: 'Eine erwartete Spalte fehlt in public.users. Bitte SUPABASE_SETUP.md erneut ausführen.' },
          { status: 500 }
        );
      }

      if (insertError.code === '42501') {
        return NextResponse.json(
          { message: 'Keine Schreibrechte auf public.users. Bitte prüfen Sie SUPABASE_SERVICE_ROLE_KEY in Vercel.' },
          { status: 500 }
        );
      }

      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: 'Diese E-Mail-Adresse bereits registriert' },
          { status: 400 }
        );
      }

      if (insertError.code === '23502') {
        return NextResponse.json(
          { message: 'Datenbank-Schema unvollständig (NOT NULL). Bitte SUPABASE_SETUP.md erneut ausführen.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: `Registrierung fehlgeschlagen (${insertError.code ?? 'unbekannt'}): ${insertError.message ?? 'keine Details'}`,
          details: insertError.details ?? null,
          hint: insertError.hint ?? null,
        },
        { status: 500 }
      );
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${user.id}`;

    // Bestätigungs-E-Mail senden
    let emailWarning: string | null = null;
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@onboarding.resend.dev';

      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: data.email,
        subject: 'Bestätigen Sie Ihre Registrierung',
        html: `
          <h2>Willkommen beim Produktions-Profit-Tool!</h2>
          <p>Vielen Dank für die Registrierung, ${data.name}.</p>
          <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Zugang zur vollständigen Analyse zu erhalten:</p>
          <p><a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">E-Mail bestätigen</a></p>
          <p style="font-size: 12px; color: #666;">Oder kopieren Sie diese URL: ${verificationUrl}</p>
          <p style="font-size: 12px; color: #666;">Freundliche Grüße,<br/>Das Produktions-Profit-Tool Team</p>
        `,
      });

      if (emailResult.error) {
        throw new Error(emailResult.error.message || 'Unbekannter Resend-Fehler');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      const fromEmail = process.env.RESEND_FROM_EMAIL || '';
      const usingTestDomain = fromEmail.includes('onboarding.resend.dev');
      emailWarning = usingTestDomain
        ? 'Die Test-Domain von Resend (onboarding.resend.dev) erlaubt nur den Versand an die E-Mail-Adresse Ihres Resend-Kontos. Bitte verwenden Sie unten den Bestätigungslink oder verifizieren Sie eine eigene Domain unter resend.com/domains.'
        : 'Bestätigungs-E-Mail konnte nicht versendet werden. Bitte prüfen Sie RESEND_API_KEY und RESEND_FROM_EMAIL.';
    }

    return NextResponse.json(
      {
        message: 'Registrierung erfolgreich. Bitte bestätigen Sie jetzt Ihre E-Mail, bevor Sie sich einloggen.',
        userId: user.id,
        emailWarning,
        // Im Dev-Modus den Verifikationslink direkt zurückgeben, damit kein E-Mail-Versand nötig ist
        devVerificationUrl: isDev ? verificationUrl : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Validierungsfehler',
          details: error.format(),
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Interner Fehler' },
      { status: 500 }
    );
  }
}
