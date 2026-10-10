import { Metadata } from 'next';
import { ShopClient } from './ShopClient';

export const metadata: Metadata = {
  title: 'Hardware Store — Custom NFC Cards & Standees | QRslice',
  description: 'Shop laser-etched Google review standees, luxury metal NFC cards, and tap counter plaques across retail, salons, gyms, clinics, and hospitality.',
};

export default function ShopPage() {
  return <ShopClient />;
}
