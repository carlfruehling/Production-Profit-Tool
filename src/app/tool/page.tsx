import { Metadata } from 'next';
import ToolPageClient from '@/components/ToolPageClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata({
  title: 'Analyse-Tool',
  description: 'Interner App-Bereich zur Analyse von Vollkosten, Grenzkosten, Kapazität und Deckungsbeitrag für Fertigungsaufträge.',
});

export default function ToolPage() {
  return <ToolPageClient />;
}
