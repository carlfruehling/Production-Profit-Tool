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
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={handleAccept}
          aria-label="Banner schließen"
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:static md:order-last md:ml-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <p className="text-sm text-gray-800 pr-6 md:pr-0">
          Wir nutzen essentielle Cookies (z. B. Login-Session) sowie pseudonymisierte Nutzungsdaten zur Messung von Besuchen,
          Tool-Nutzung und Registrierungen. Mit Klick auf
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
