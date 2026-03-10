import { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Neues Passwort – Produktions-Profit-Tool',
  description: 'Neues Passwort vergeben',
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Neues Passwort vergeben</h1>
          <p className="text-gray-600">Wählen Sie ein sicheres Passwort mit mindestens 8 Zeichen.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
