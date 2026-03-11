'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

interface RegistrationData {
  name: string;
  company: string;
  position?: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirm: string;
  consentData: boolean;
}

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationData>({
    defaultValues: {
      consentData: false,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegistrationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registrierung fehlgeschlagen');
      }

      const responseBody = await response.json();
      setEmailWarning(responseBody?.emailWarning || null);
      setDevVerificationUrl(responseBody?.devVerificationUrl || null);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-green-900 mb-2">
          ✓ Registrierung erfolgreich!
        </h3>
        <p className="text-green-800 text-sm">
          Ihr Zugang wurde angelegt. Bitte bestätigen Sie jetzt Ihre E-Mail und loggen Sie sich danach ein.
        </p>
        {devVerificationUrl && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-left">
            <p className="text-blue-800 text-sm font-semibold mb-2">🔧 Entwicklungsmodus</p>
            <p className="text-blue-700 text-sm mb-2">
              E-Mail-Versand nicht verfügbar. Klicken Sie direkt auf den Bestätigungslink:
            </p>
            <a
              href={devVerificationUrl}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              E-Mail jetzt bestätigen
            </a>
          </div>
        )}
        {emailWarning && !devVerificationUrl && (
          <p className="text-amber-700 text-sm mt-3 bg-amber-50 border border-amber-200 rounded p-3">
            {emailWarning}
          </p>
        )}
        <Link
          href="/login"
          className="inline-block mt-4 bg-green-600 text-white px-5 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
        >
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Erforderlich' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Firma *
          </label>
          <input
            type="text"
            {...register('company', { required: 'Erforderlich' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <input
            type="text"
            {...register('position')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail *
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Erforderlich',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ungültige E-Mail' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort *
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Erforderlich',
              minLength: { value: 8, message: 'Mindestens 8 Zeichen' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort wiederholen *
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('passwordConfirm', {
              required: 'Erforderlich',
              validate: (val) => val === passwordValue || 'Passwörter stimmen nicht überein',
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.passwordConfirm && <p className="text-red-600 text-sm mt-1">{errors.passwordConfirm.message}</p>}
        </div>

        <div className="pt-4 border-t">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('consentData', { required: 'Bitte stimmen Sie der Datenschutzerklärung zu' })}
              className="mt-1 h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              Ich habe die{' '}
              <Link href="/datenschutz" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                Datenschutzerklärung
              </Link>{' '}
              gelesen und stimme der Speicherung und Verarbeitung meiner Daten zu. *
            </span>
          </label>
          {errors.consentData && <p className="text-red-600 text-sm mt-1">{errors.consentData.message}</p>}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Wird registriert...' : 'Registrieren'}
        </button>
      </form>
    </div>
  );
}
