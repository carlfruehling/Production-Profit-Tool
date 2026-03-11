import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Zugang - Produktions-Profit-Tool',
  description: 'Login oder Registrierung für den Zugriff auf das Tool',
};

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zugang zum Tool</h1>
          <p className="text-gray-600">
            Bitte melden Sie sich an oder registrieren Sie sich, um das Produktions-Profit-Tool zu nutzen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Bereits registriert?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Melden Sie sich mit Ihrer E-Mail-Adresse an und öffnen Sie direkt das Tool.
            </p>
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white py-3 rounded-md font-semibold text-center hover:bg-blue-700 transition-colors"
            >
              Zum Login
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Neu hier?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Erstellen Sie Ihren kostenlosen Zugang in unter einer Minute und starten Sie sofort mit der Analyse.
            </p>
            <Link
              href="/register"
              className="block w-full bg-green-600 text-white py-3 rounded-md font-semibold text-center hover:bg-green-700 transition-colors"
            >
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
