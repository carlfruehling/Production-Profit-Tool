import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    if (!session?.emailVerified) {
      return NextResponse.json(
        { message: 'Nicht autorisiert. Bitte einloggen und E-Mail bestätigen.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('calculation_history')
      .select('id, calculation_input, calculation_result, pricing_signal, created_at')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ message: 'Historie konnte nicht geladen werden.' }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error('[history] GET error', error);
    return NextResponse.json({ message: 'Interner Fehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    if (!session?.emailVerified) {
      return NextResponse.json(
        { message: 'Nicht autorisiert. Bitte einloggen und E-Mail bestätigen.' },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'id fehlt' }, { status: 400 });
    }

    const { error } = await supabase
      .from('calculation_history')
      .delete()
      .eq('id', id)
      .eq('user_id', session.userId);

    if (error) {
      return NextResponse.json({ message: 'Eintrag konnte nicht gelöscht werden.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Gelöscht' }, { status: 200 });
  } catch (error) {
    console.error('[history] DELETE error', error);
    return NextResponse.json({ message: 'Interner Fehler' }, { status: 500 });
  }
}
