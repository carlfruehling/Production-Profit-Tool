import { NextRequest, NextResponse } from 'next/server';
import { getCanonicalHost } from '@/lib/seo';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, verifySessionToken } from '@/lib/session';

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production';
  const host = request.headers.get('host')?.toLowerCase();
  const canonicalHost = getCanonicalHost().toLowerCase();

  if (isProduction && host && host !== canonicalHost) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = 'https:';
    redirectUrl.host = canonicalHost;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const needsSessionHandling =
    pathname.startsWith('/tool') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  if (!needsSessionHandling) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const hasValidSession = !!session;
  const hasVerifiedSession = !!session?.emailVerified;

  if ((pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) && hasVerifiedSession) {
    return NextResponse.redirect(new URL('/tool', request.url));
  }

  const response = NextResponse.next();
  if (token && !hasValidSession) {
    clearSessionCookie(response);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)'],
};
