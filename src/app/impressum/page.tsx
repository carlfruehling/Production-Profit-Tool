import { Metadata } from 'next';
import Link from 'next/link';
import { createPublicMetadata } from '@/lib/seo';

export const metadata: Metadata = createPublicMetadata({
  title: 'Impressum der Fruehling Corporate GmbH',
  description: 'Anbieterkennzeichnung, Kontakt und Verantwortlichkeit für die Website Produktions-Profit-Tool.',
  path: '/impressum',
});

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Angaben gemäß § 5 DDG
            </h2>
            <p>
              Fruehling Corporate GmbH
              <br />
              Sülldorfer Landstraße 227a
              <br />
              22589 Hamburg
              <br />
              Deutschland
              <br />
              <br />
              Geschäftsführer: Carl Frühling
              <br />
              <br />
              Registergericht: Amtsgericht Hamburg
              <br />
              Handelsregisternummer: HRB 195704

            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Kontakt
            </h2>
            <p>
              E-Mail: cfruehling@live.de
              <br />
              Telefon: +49 (0) 40 9436 3116
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>
              Carl Frühling
              <br />
              Sülldorfer Landstraße 227a
              <br />
              22589 Hamburg

            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Haftungsausschluss
            </h2>
            <p>
              Die Inhalte dieser Website wurden sorgfältig erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte besteht jedoch keine Gewähr.
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
