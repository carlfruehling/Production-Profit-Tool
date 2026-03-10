'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

interface FormData {
  email: string;
}

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || 'Fehler beim Senden');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">📬</div>
        <h3 className="text-lg font-bold text-green-900 mb-2">Anfrage gesendet</h3>
        <p className="text-green-800 text-sm">
          Wenn diese E-Mail-Adresse bei uns registriert ist, erhalten Sie in Kürze eine Nachricht mit
          einem Link zum Zurücksetzen Ihres Passworts. Bitte prüfen Sie auch Ihren Spam-Ordner.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 text-sm text-blue-700 hover:text-blue-900 underline"
        >
          Zurück zum Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
          <input
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Erforderlich',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ungültige E-Mail' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
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
          {loading ? 'Wird gesendet...' : 'Link anfordern'}
        </button>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-700 hover:text-blue-900">
            Zurück zum Login
          </Link>
        </p>
      </form>
    </div>
  );
}
