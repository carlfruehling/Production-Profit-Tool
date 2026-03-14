import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#00AAAA] flex items-center gap-2">
            <Image src="/favicon.ico" alt="" width={28} height={28} />
            Produktions-Profit-Tool
          </h1>
          <p className="text-gray-600 text-sm">Aufträge wirtschaftlich bewerten und profitabler kalkulieren</p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bessere Preisfindung für Ihre Fertigungsaufträge im Marktvergleich
          </h2>
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

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl mb-2">📈</div>
            <h4 className="font-semibold text-gray-900 mb-2">Direkter Marktvergleich</h4>
            <p className="text-sm text-gray-600">
              Sehen Sie sofort, ob Ihr Deckungsbeitrag pro Stunde über oder unter dem Branchenwert
              vergleichbarer Aufträge liegt.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="font-semibold text-gray-900 mb-2">Bessere Preisstrategie</h4>
            <p className="text-sm text-gray-600">
              Kombinieren Sie Vollkosten, Grenzkosten und Benchmarks, um freie Kapazitäten gezielt
              profitabel zu belegen.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="text-3xl mb-2">🧠</div>
            <h4 className="font-semibold text-gray-900 mb-2">Lernt mit jeder Kalkulation</h4>
            <p className="text-sm text-gray-600">
              Der Vergleich startet mit realistischen Seed-Daten und wird mit echten Berechnungen im
              Zeitverlauf präziser.
            </p>
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
