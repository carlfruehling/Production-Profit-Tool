import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Login - Produktions-Profit-Tool',
  description: 'Login zum Produktions-Profit-Tool',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Melden Sie sich an, um das Produktions-Profit-Tool zu nutzen.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Noch kein Zugang?{' '}
            <Link href="/register" className="text-blue-700 hover:text-blue-900">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
