import { Metadata } from 'next';
import Link from 'next/link';
import { createPublicMetadata } from '@/lib/seo';

export const metadata: Metadata = createPublicMetadata({
  title: 'Datenschutzerklärung für das Produktions-Profit-Tool',
  description: 'Informationen zur Verarbeitung personenbezogener Daten, Cookies und Betroffenenrechten beim Produktions-Profit-Tool.',
  path: '/datenschutz',
});

export default function DataPrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Datenschutzerklärung
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              1. Datenverarbeitung
            </h2>
            <p>
              Wir versprechen einen verantwortungsvollen Umgang mit Ihren Daten.
              Persönliche Informationen werden nur mit Ihrer ausdrücklichen Zustimmung
              erfasst und verarbeitet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              2. Gespeicherte Daten
            </h2>
            <p>
              Folgende Informationen werden nach Ihrer Registrierung bis zur Löschung 
              Ihres Kontos gespeichert:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Name</li>
              <li>Firma und Position</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer (optional)</li>
              <li>Zustimmungsdaten</li>
            </ul>
            <p>
              Zusätzlich erfassen wir pseudonymisierte Nutzungsereignisse, um Reichweite und Conversion der Website zu messen.
              Dazu zählen Seitenaufrufe, erfolgreiche Tool-Berechnungen und abgeschlossene Registrierungen. Die technische
              Zuordnung erfolgt ausschließlich über gehashte Verbindungsdaten und den Browser-User-Agent, nicht über Klarnamen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              3. Weitergabe an Dritte
            </h2>
            <p>
              Ihre Daten werden nicht an Dritte weitergegeben.
              Sie werden ausschließlich zur Verbesserung unseres Services genutzt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              4. Ihre Rechte
            </h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
              Datenportabilität Ihrer persönlichen Daten. Schreiben Sie uns dazu 
              einfach eine E-Mail an die Adresse, die Sie in unserem Impressum finden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              5. Cookies
            </h2>
            <p>
              Diese Website nutzt essenzielle Cookies für die Funktionalität sowie pseudonymisierte Nutzungsdaten zur internen
              Erfolgsmessung. Es werden keine Werbe-Cookies und keine Drittanbieter-Tracking-Skripte eingesetzt.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
