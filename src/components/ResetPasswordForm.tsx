'use client';

import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface FormData {
  password: string;
  passwordConfirm: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const passwordValue = watch('password');

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 text-sm mb-4">
          Ungültiger Link. Bitte fordern Sie einen neuen Link an.
        </p>
        <Link href="/forgot-password" className="text-blue-700 hover:text-blue-900 text-sm underline">
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-lg font-bold text-green-900 mb-2">Passwort geändert!</h3>
        <p className="text-green-800 text-sm mb-4">
          Ihr Passwort wurde erfolgreich gesetzt. Sie können sich jetzt einloggen.
        </p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="inline-block bg-green-600 text-white px-5 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
        >
          Zum Login
        </button>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Fehler beim Zurücksetzen');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort *</label>
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
            Passwort bestätigen *
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
          {errors.passwordConfirm && (
            <p className="text-red-600 text-sm mt-1">{errors.passwordConfirm.message}</p>
          )}
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
          {loading ? 'Wird gespeichert...' : 'Passwort speichern'}
        </button>
      </form>
    </div>
  );
}
