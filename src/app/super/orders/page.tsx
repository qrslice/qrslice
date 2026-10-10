import { Suspense } from 'react';
import { Metadata } from 'next';
import { SuperOrdersClient } from './SuperOrdersClient';

export const metadata: Metadata = {
  title: 'Hardware Orders Management | QRslice Superadmin',
  description: 'View orders and convert customer purchases into manufacturing card batches.',
};

export default function SuperOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading orders...</div>}>
      <SuperOrdersClient />
    </Suspense>
  );
}
