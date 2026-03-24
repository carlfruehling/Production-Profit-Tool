import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
        <div className="mb-4 space-x-4">
          <Link href="/tool" className="hover:text-blue-600">
            Tool
          </Link>
          <span>•</span>
          <Link href="/funktionsweise" className="hover:text-blue-600">
            Funktionsweise
          </Link>
          <span>•</span>
          <Link href="/maschinenstundensatz-fertigung" className="hover:text-blue-600">
            Maschinenstundensatz
          </Link>
          <span>•</span>
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
  );
}