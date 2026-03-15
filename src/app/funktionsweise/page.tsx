import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Funktionsweise',
  description: 'Erfahren Sie, wie das Produktions-Profit-Tool Vollkosten, Grenzkosten, Kapazität und Marktvergleich für Fertigungsaufträge berechnet.',
  alternates: {
    canonical: '/funktionsweise',
  },
};

export default function FunktionsweisePage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Funktionsweise des Produktions-Profit-Tools</h1>

        <section className="mb-8 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Eingabedaten erfassen</h2>
          <p>
            Sie geben zentrale Auftrags- und Betriebsdaten ein, etwa Angebotspreis, Materialkosten,
            Bearbeitungszeit, freie Maschinenstunden und Liefertermin. Optional können Sie den
            Maschinenstundensatz direkt eingeben oder auf Basis von Investitions- und Personaldaten schätzen.
          </p>
        </section>

        <section className="mb-8 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Wirtschaftlichkeit berechnen</h2>
          <p>
            Das Tool berechnet Deckungsbeitrag, Mindestpreis, Grenzkostenpreis und Opportunitätskosten.
            Zusätzlich wird berücksichtigt, wie viel freie Kapazität bis zum Liefertermin verfügbar ist,
            damit Preisentscheidungen im Kontext der tatsächlichen Auslastung erfolgen.
          </p>
        </section>

        <section className="mb-8 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Ergebnisse im Marktkontext einordnen</h2>
          <p>
            Der berechnete Deckungsbeitrag pro Stunde wird mit vergleichbaren Aufträgen abgeglichen.
            Dadurch erhalten Sie eine nachvollziehbare Orientierung, ob Ihr Angebot im aktuellen Marktfenster
            eher unter, im oder über dem Vergleich liegt.
          </p>
        </section>

        <section className="mb-10 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Entscheidung absichern</h2>
          <p>
            Auf dieser Basis können Sie Angebotsentscheidungen gegenüber Vertrieb, Arbeitsvorbereitung
            und Geschäftsführung konsistent begründen und Preisspielräume transparenter steuern.
          </p>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link href="/tool" className="text-blue-700 hover:text-blue-900 font-medium">
            Zur Produktseite und Analyse
          </Link>
          <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium">
            Zur Startseite
          </Link>
          <Link href="/impressum" className="text-blue-700 hover:text-blue-900 font-medium">
            Kontakt und Impressum
          </Link>
        </div>
      </div>
    </main>
  );
}
