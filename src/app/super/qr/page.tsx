import React from 'react';
import { QRManagementClient } from './QRManagementClient';

export const metadata = {
  title: 'Digital QR & NFC Assets | QRslice Superadmin',
  description: 'Manage active QR destinations, UPI payment VPAs, vector artwork downloads, and scan metrics.',
};

export default function SuperQRPage() {
  return <QRManagementClient />;
}
