'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CONSENT_COOKIE_NAME = 'ppt_cookie_consent';
const CONSENT_COOKIE_VALUE = 'accepted';
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function hasConsentCookie() {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .some((entry) => entry === `${CONSENT_COOKIE_NAME}=${CONSENT_COOKIE_VALUE}`);
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisible(!hasConsentCookie());
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleAccept = () => {
    document.cookie = `${CONSENT_COOKIE_NAME}=${CONSENT_COOKIE_VALUE}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-800">
          Wir nutzen aktuell nur essentielle Cookies (z. B. Login-Session), damit die Anwendung funktioniert. Mit Klick auf
          <span className="font-semibold"> &quot;Zustimmen&quot; </span>
          bestätigen Sie die Nutzung. Details finden Sie in unserer{' '}
          <Link href="/datenschutz" className="text-blue-700 underline hover:text-blue-900">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Zustimmen
        </button>
      </div>
    </div>
  );
}
