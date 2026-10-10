import { Metadata } from 'next';
import { SuperOverviewClient } from './SuperOverviewClient';

export const metadata: Metadata = {
  title: 'Hardware Fleet Command | QRslice Superadmin',
  description: 'Command center for physical NFC products, customer orders, batch minting, and logistics.',
};

export default function SuperOverviewPage() {
  return <SuperOverviewClient />;
}
