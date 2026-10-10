import { Metadata } from 'next';
import { OrdersClient } from './OrdersClient';

export const metadata: Metadata = {
  title: 'Hardware Orders & Tracking | QRslice Account',
  description: 'Track your custom laser-etched NFC standees and cards in real time.',
};

export default function AccountOrdersPage() {
  return <OrdersClient />;
}
