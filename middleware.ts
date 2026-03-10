import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, verifySessionToken } from '@/lib/session';

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const hasValidSession = !!session;
  const hasVerifiedSession = !!session?.emailVerified;

  if (pathname.startsWith('/tool') && !hasValidSession) {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    if (token) {
      clearSessionCookie(response);
    }
    return response;
  }

  if (pathname.startsWith('/tool') && !hasVerifiedSession) {
    const response = NextResponse.redirect(new URL('/login?verify=1', request.url));
    clearSessionCookie(response);
    return response;
  }

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
  matcher: ['/tool/:path*', '/auth', '/login', '/register'],
};
