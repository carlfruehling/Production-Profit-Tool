import { Metadata } from 'next';
import Link from 'next/link';
import { buildAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Maschinenstundensatz in der Fertigung richtig kalkulieren',
  description: 'Maschinenstundensatz in der Fertigung verständlich kalkulieren: Grundlage für Angebotskalkulation, Preisfindung, CNC-Auslastung und stabile Profitabilität.',
  alternates: {
    canonical: '/maschinenstundensatz-fertigung',
  },
};

export default function MaschinenstundensatzFertigungPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Maschinenstundensatz richtig kalkulieren: Warum er für profitable Angebote entscheidend ist',
    description: 'Praxisorientierte Erklärung, wie der Maschinenstundensatz in der Fertigung als Basis für belastbare Angebotskalkulationen genutzt wird.',
    inLanguage: 'de-DE',
    mainEntityOfPage: buildAbsoluteUrl('/maschinenstundensatz-fertigung'),
    publisher: {
      '@type': 'Organization',
      name: 'Fruehling Corporate GmbH',
      url: buildAbsoluteUrl('/'),
    },
  };

  return (
    <main className="min-h-screen bg-white py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Warum der Maschinenstundensatz für profitable Angebote entscheidend ist
        </h1>

        <section className="mb-8 text-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Maschinenstundensatz als Fundament der Angebotskalkulation</h2>
          <p className="mb-3">
            In der Fertigung entscheidet der Maschinenstundensatz wesentlich darüber, ob ein Angebot wirtschaftlich tragfähig ist.
            Er übersetzt die laufenden Kosten einer Maschine in einen Stundenwert und schafft damit eine belastbare Basis
            für die Angebotskalkulation bei Einzelteilen, Serien und CNC-Bearbeitung.
          </p>
          <p>
            Wer diese Größe sauber bestimmt, kann Preise nachvollziehbar begründen und intern klar kommunizieren,
            warum ein Auftrag angenommen, nachverhandelt oder abgelehnt werden sollte.
          </p>
        </section>

        <section className="mb-8 text-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Warum pauschale Werte zu Fehlentscheidungen führen</h2>
          <p className="mb-3">
            In vielen Betrieben werden Stundensätze aus Erfahrung, Bauchgefühl oder aus allgemeinen Marktwerten abgeleitet.
            Das wirkt im Alltag pragmatisch, ist aber oft unpräzise, weil die tatsächliche Kostenstruktur, die Auslastung
            und der reale Auftragsmix nicht ausreichend berücksichtigt werden.
          </p>
          <p>
            Zu niedrig angesetzte Werte führen schnell zu Verlustaufträgen. Zu hoch angesetzte Werte verschlechtern hingegen
            die Wettbewerbsfähigkeit und kosten Marktchancen in der Fertigung.
          </p>
        </section>

        <section className="mb-8 text-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Kosten systematisch erfassen und auf produktive Stunden verteilen</h2>
          <p className="mb-3">
            Für eine verlässliche Kalkulation müssen die maschinenbezogenen Kosten strukturiert erfasst werden.
            Dazu zählen typischerweise Investition, Abschreibung, Energie, Instandhaltung und weitere laufende Betriebskosten.
          </p>
          <p>
            Diese Kosten werden auf realistische produktive Stunden verteilt, nicht auf theoretische Kalenderstunden.
            Genau an dieser Stelle entsteht häufig der größte Unterschied zwischen einer formalen Rechnung und einer
            praxisnahen, entscheidungsfähigen Kalkulation.
          </p>
        </section>

        <section className="mb-8 text-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Maschinenkosten und Personalkosten getrennt bewerten</h2>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Getrennte Sicht schafft Klarheit</h3>
          <p className="mb-3">
            Maschinenkosten und Personalkosten sollten in der Angebotskalkulation getrennt betrachtet werden.
            Nur so wird sichtbar, ob Abweichungen aus der Technik, aus der Personalplanung oder aus der Prozessorganisation
            stammen.
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Auslastung beeinflusst den Stundensatz direkt</h3>
          <p>
            Die Auslastung hat einen direkten Effekt auf den Maschinenstundensatz: Sinkt die Zahl produktiver Stunden,
            steigt der Kostenanteil je Stunde; steigt die produktive Nutzung, sinkt er entsprechend. Gerade bei schwankender
            CNC-Auslastung ist dieser Zusammenhang für die Preisfindung zentral.
          </p>
        </section>

        <section className="mb-10 text-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Von der reinen Satzkalkulation zur profitablen Auftragsentscheidung</h2>
          <p className="mb-3">
            Eine saubere Maschinenstundensatz-Kalkulation bleibt unverzichtbar. In der Praxis reicht sie jedoch oft nicht aus,
            wenn sich freie Kapazitäten, Liefertermine und Auftragsprioritäten laufend ändern.
          </p>
          <p>
            Genau hier setzt unser Tool an: Es verbindet die rechnerische Basis mit der aktuellen Kapazitäts- und
            Profitabilitätssicht. So bewerten Sie Aufträge nicht nur formal korrekt, sondern im konkreten betrieblichen
            Entscheidungskontext.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-sm sm:text-base">
          <Link href="/tool" className="text-blue-700 hover:text-blue-900 font-medium">
            Zum Tool für die Auftragsbewertung
          </Link>
          <Link href="/funktionsweise" className="text-blue-700 hover:text-blue-900 font-medium">
            Zur Funktionsweise der Kalkulation
          </Link>
          <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
