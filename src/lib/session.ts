export const SESSION_COOKIE_NAME = 'ppt_session';

type SessionPayload = {
  userId: string;
  emailVerified: boolean;
  exp: number;
};

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

function getSessionSecret() {
  const configuredSecret = process.env.SESSION_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Dev fallback to keep local setup simple. In production SESSION_SECRET is mandatory.
  return 'dev-only-session-secret-change-me';
}

function base64UrlEncodeText(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecodeText(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecodeBytes(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signPayload(payloadBase64: string, secret: string) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    return null;
  }

  const key = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await cryptoApi.subtle.sign('HMAC', key, new TextEncoder().encode(payloadBase64));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

async function verifySignature(payloadBase64: string, signatureBase64: string, secret: string) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    return false;
  }

  const key = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  return cryptoApi.subtle.verify(
    'HMAC',
    key,
    base64UrlDecodeBytes(signatureBase64),
    new TextEncoder().encode(payloadBase64)
  );
}

export async function createSessionToken(userId: string, emailVerified: boolean) {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const payload: SessionPayload = {
    userId,
    emailVerified,
    exp: Math.floor(Date.now() / 1000) + SESSION_COOKIE_OPTIONS.maxAge,
  };

  const payloadBase64 = base64UrlEncodeText(JSON.stringify(payload));
  const signatureBase64 = await signPayload(payloadBase64, secret);
  if (!signatureBase64) {
    return null;
  }

  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const [payloadBase64, signatureBase64] = token.split('.');
  if (!payloadBase64 || !signatureBase64) {
    return null;
  }

  const signatureValid = await verifySignature(payloadBase64, signatureBase64, secret);
  if (!signatureValid) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecodeText(payloadBase64)) as SessionPayload;
    if (!parsed.userId || typeof parsed.emailVerified !== 'boolean' || typeof parsed.exp !== 'number') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp <= now) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
