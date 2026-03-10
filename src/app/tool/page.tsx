'use client';

import { useRouter } from 'next/navigation';
import CalculatorForm from '@/components/CalculatorForm';

export default function ToolPage() {
  const router = useRouter();

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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">📊 Produktions-Profit-Tool</h1>
            <p className="text-gray-600 text-sm">Wirtschaftlichkeitsanalyse für Fertigungsaufträge</p>
          </div>
          <button
            type="button"
            className="text-sm text-blue-700 hover:text-blue-900"
            onClick={handleLogout}
          >
            Abmelden
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Geben Sie Ihre Betriebs- und Auftragsdaten ein:
          </h2>
          <CalculatorForm />
        </div>
      </div>
    </main>
  );
}
