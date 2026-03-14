'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CalculatorForm from '@/components/CalculatorForm';

export default function ToolPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/session', { method: 'GET' });
        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const body = await response.json() as { authenticated?: boolean };
        setIsAuthenticated(body.authenticated === true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    void checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 whitespace-nowrap flex items-center gap-2"><Image src="/favicon.ico" alt="" width={28} height={28} />Produktions-Profit-Tool</h1>
            <p className="text-gray-600 text-sm">Wirtschaftlichkeitsanalyse für Fertigungsaufträge</p>
          </div>
          {isAuthenticated && (
          <button
            type="button"
            className="mt-3 sm:mt-0 text-sm text-blue-700 hover:text-blue-900"
            onClick={handleLogout}
          >
            Abmelden
          </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Geben Sie Ihre Betriebs- und Auftragsdaten ein:
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Jede Berechnung wird zusätzlich mit einem lernenden Marktbenchmark für vergleichbare Aufträge
            nach Zeit, Angebotspreis und Maschinenstundensatz verglichen.
          </p>
          <CalculatorForm />
        </div>
      </div>
    </main>
  );
}
