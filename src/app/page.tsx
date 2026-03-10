import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">
            📊 Produktions-Profit-Tool
          </h1>
          <p className="text-gray-600 text-sm">Aufträge wirtschaftlich bewerten und profitabler kalkulieren</p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Mehr Klarheit bei Preisentscheidungen in der Fertigung
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Ermitteln Sie Vollkosten, Grenzkosten und Kapazitätseffekte in unter einer Minute.
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

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl mb-2">⏱️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Schnelle Entscheidung</h4>
            <p className="text-sm text-gray-600">
              Sehen Sie direkt, ob ein Auftrag über Vollkosten oder nur über Grenzkosten tragfähig ist.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="font-semibold text-gray-900 mb-2">Bessere Preisstrategie</h4>
            <p className="text-sm text-gray-600">
              Nutzen Sie freie Kapazitäten gezielt und vermeiden Sie Aufträge unter Grenzkosten.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold text-gray-900 mb-2">Strukturierter Workflow</h4>
            <p className="text-sm text-gray-600">
              Login oder Registrierung und danach direkter Zugriff auf das Tool.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-700 mb-4">
            Starten Sie mit Ihrem Zugang und öffnen Sie danach den Kalkulator.
          </p>
          <Link
            href="/auth"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Zum Login / zur Registrierung
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
