import { Metadata } from 'next';
import RegistrationForm from '@/components/RegistrationForm';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata({
  title: 'Registrierung',
  description: 'Registrierung für ein Nutzerkonto im Produktions-Profit-Tool.',
});

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kostenlose Registrierung
          </h1>
          <p className="text-gray-600">
            Registrieren Sie sich zur Nutzung des Produktions-Profit-Tools. Sie erhalten Zugang zu detaillierten Analysen, 
            Handlungsempfehlungen und können Ihre Berechnungen speichern.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <RegistrationForm />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sie erhalten eine Bestätigungs-E-Mail. Bitte bestätigen Sie Ihre E-Mail-Adresse.</p>
        </div>
      </div>
    </main>
  );
}
