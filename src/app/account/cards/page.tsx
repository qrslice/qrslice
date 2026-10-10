import { Metadata } from 'next';
import { CardsClient } from './CardsClient';

export const metadata: Metadata = {
  title: 'My NFC Devices | QRslice Account',
  description: 'Manage your active NFC standees, cards, tap counters, and destinations.',
};

export default function AccountCardsPage() {
  return <CardsClient />;
}
