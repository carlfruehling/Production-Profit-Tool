import { NextRequest } from 'next/server';

function getConfiguredToken(envKeys: string[]) {
  for (const envKey of envKeys) {
    const value = process.env[envKey]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function readAdminToken(request: NextRequest) {
  const headerToken = request.headers.get('x-admin-token')?.trim();
  if (headerToken) {
    return headerToken;
  }

  const authorization = request.headers.get('authorization')?.trim();
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return null;
}

export function authorizeAdminRequest(
  request: NextRequest,
  options?: {
    envKeys?: string[];
  }
) {
  const expectedToken = getConfiguredToken(options?.envKeys ?? ['BENCHMARK_ADMIN_TOKEN']);

  if (!expectedToken) {
    return { ok: false, status: 503, message: 'Admin-Token ist nicht konfiguriert.' };
  }

  const receivedToken = readAdminToken(request);
  if (!receivedToken || receivedToken !== expectedToken) {
    return { ok: false, status: 401, message: 'Nicht autorisiert.' };
  }

  return { ok: true as const };
}