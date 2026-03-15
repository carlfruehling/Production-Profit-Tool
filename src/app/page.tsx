import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { buildAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Startseite',
  description: 'Bewerten Sie die Profitabilität von Fertigungsaufträgen mit Vollkosten-, Grenzkosten-, Kapazitäts- und Benchmark-Analyse.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fruehling Corporate GmbH',
    url: buildAbsoluteUrl('/'),
    email: 'cfruehling@live.de',
    telephone: '+49-40-9436-3116',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sülldorfer Landstraße 227a',
      postalCode: '22589',
      addressLocality: 'Hamburg',
      addressCountry: 'DE',
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Produktions-Profit-Tool',
    url: buildAbsoluteUrl('/'),
    inLanguage: 'de-DE',
  };

  const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Produktions-Profit-Tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Web-Tool zur wirtschaftlichen Bewertung und Optimierung von Angebotskalkulationen in produzierenden Betrieben.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    url: buildAbsoluteUrl('/tool'),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Für wen ist das Produktions-Profit-Tool gedacht?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Das Tool richtet sich an produzierende Betriebe, die Angebotskalkulationen auf Wirtschaftlichkeit prüfen und Preise fundierter festlegen möchten.',
        },
      },
      {
        '@type': 'Question',
        name: 'Welche Kennzahlen werden ausgewertet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Es werden unter anderem Deckungsbeitrag, Mindestpreis, Grenzkostenpreis, Maschinenstundensatz, verfügbare Kapazität bis Liefertermin und Opportunitätskosten berechnet.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kann ich das Tool ohne Registrierung testen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, eine erste Analyse ist ohne Anmeldung möglich. Für weitere Analysen ist eine Anmeldung erforderlich.',
        },
      },
      {
        '@type': 'Question',
        name: 'Was ist der Nutzen für die Angebotsentscheidung?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sie erkennen schnell, ob ein Auftrag zur Kapazität, zum Ziel-Deckungsbeitrag und zum Marktumfeld passt und können dadurch Preisspielräume nachvollziehbar begründen.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-2xl font-bold text-[#00AAAA] flex items-center gap-2">
            <Image src="/icon.svg" alt="" width={28} height={28} />
            Produktions-Profit-Tool
          </div>
          <p className="text-gray-600 text-sm">Aufträge wirtschaftlich bewerten und profitabler kalkulieren</p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bessere Preisfindung für Ihre Fertigungsaufträge im Marktvergleich
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ermitteln Sie Vollkosten, Grenzkosten, Kapazitätseffekte und den Deckungsbeitrag pro Stunde
            im Vergleich zu Benchmark-Aufträgen in unter 60 Sekunden.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md font-semibold text-center hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-blue-700 border border-blue-300 px-6 py-3 rounded-md font-semibold text-center hover:bg-blue-50 transition-colors"
            >
              Registrieren
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-gray-700 mb-2 font-medium">
            Öffnen Sie das Tool direkt und prüfen Sie, wie Ihr nächster Auftrag im Marktvergleich steht.
          </p>

          <Link
            href="/tool"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Zum Tool
          </Link>
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">Direkter Marktvergleich</h3>
            <p className="text-sm text-gray-600">
              Sehen Sie sofort, ob Ihr Deckungsbeitrag pro Stunde über oder unter dem Branchenwert
              vergleichbarer Aufträge liegt.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Bessere Preisstrategie</h3>
            <p className="text-sm text-gray-600">
              Kombinieren Sie Vollkosten, Grenzkosten und Benchmarks, um freie Kapazitäten gezielt
              profitabel zu belegen.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">Lernt mit jeder Kalkulation</h3>
            <p className="text-sm text-gray-600">
              Der Vergleich startet mit realistischen Seed-Daten und wird mit echten Berechnungen im
              Zeitverlauf präziser.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-12 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Was das Tool leistet</h2>
          <p className="text-gray-700 mb-3">
            Das Produktions-Profit-Tool unterstützt produzierende Unternehmen bei der Bewertung einzelner Aufträge.
            Auf Basis weniger Eingaben berechnet das Tool die wirtschaftlich relevanten Zielgrößen für die Angebotsentscheidung.
          </p>
          <p className="text-gray-700 mb-3">
            Die Analyse richtet sich an Geschäftsführung, Vertrieb und Arbeitsvorbereitung in Fertigungsbetrieben,
            die Preisentscheidungen nachvollziehbar, belastbar und kapazitätsorientiert treffen möchten.
          </p>
          <p className="text-gray-700">
            Ergebnis ist eine klare Einschätzung, ob ein Auftrag bei gegebenem Termin, Preis und Auslastung wirtschaftlich
            sinnvoll ist und welche Preisuntergrenzen aus Sicht von Vollkosten und Grenzkosten gelten.
          </p>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-12 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Häufige Fragen</h2>
          <div className="space-y-4 text-gray-700">
            <article>
              <h3 className="font-semibold text-gray-900">Für wen ist das Tool gedacht?</h3>
              <p>Für produzierende Betriebe, die Angebotskalkulationen schneller und wirtschaftlich belastbarer bewerten wollen.</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">Welche Kennzahlen sehe ich?</h3>
              <p>Unter anderem Deckungsbeitrag, Mindestpreis, Grenzkostenpreis, Kapazitätsverfügbarkeit und Opportunitätskosten.</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">Ist eine Registrierung zwingend?</h3>
              <p>Eine erste Analyse kann ohne Login durchgeführt werden. Danach ist eine Anmeldung erforderlich.</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">Warum ist der Marktvergleich relevant?</h3>
              <p>Er zeigt, ob Ihr Deckungsbeitrag pro Stunde im Kontext vergleichbarer Aufträge eher unter- oder überdurchschnittlich liegt.</p>
            </article>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-12 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Weiterführende Informationen</h2>
          <div className="grid gap-3 sm:grid-cols-2">

            <Link href="/maschinenstundensatz-fertigung" className="text-blue-700 hover:text-blue-900 font-medium">
              Maschinenstundensatz in der Fertigung
            </Link>
            <Link href="/funktionsweise" className="text-blue-700 hover:text-blue-900 font-medium">
              Funktionsweise des Tools
            </Link>

          </div>
        </section>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">

          <Link
            href="/tool"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Zum Tool
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <div className="mb-4 space-x-4">
            <Link href="/impressum" className="hover:text-blue-600">
              Impressum
            </Link>
            <span>•</span>
            <Link href="/datenschutz" className="hover:text-blue-600">
              Datenschutzerklärung
            </Link>
          </div>
          <p>© 2026 Fruehling Corporate GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </main>
  );
}
