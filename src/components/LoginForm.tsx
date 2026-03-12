'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface LoginData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyRequired = searchParams.get('verify') === '1';
  const nextPath = searchParams.get('next');
  const redirectPath = nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
    ? nextPath
    : '/tool';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Login fehlgeschlagen');
      }

      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {verifyRequired && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Danach ist der Login möglich.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
          <input
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Erforderlich' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-sm text-blue-700 hover:text-blue-900">
              Passwort vergessen?
            </Link>
          </div>
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
          {loading ? 'Anmeldung läuft...' : 'Einloggen'}
        </button>
      </form>
    </div>
  );
}
