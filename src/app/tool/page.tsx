import { Metadata } from 'next';
import ToolPageClient from '@/components/ToolPageClient';

export const metadata: Metadata = {
  title: 'Produktseite und Analyse',
  description: 'Produktions-Profit-Tool zur Analyse von Vollkosten, Grenzkosten, Kapazität und Deckungsbeitrag für Fertigungsaufträge.',
  alternates: {
    canonical: '/tool',
  },
};

export default function ToolPage() {
  return <ToolPageClient />;
}
