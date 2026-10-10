import React, { Suspense } from 'react';
import { ProductsClient } from './ProductsClient';

export const metadata = {
  title: 'Products Catalog — QrSlice Smart NFC & QR Hardware',
  description: 'Explore our complete catalog of Google review standees, NFC business cards, social media displays, UPI stands, and restaurant menu displays.',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading QrSlice Catalog...</div>}>
      <ProductsClient />
    </Suspense>
  );
}
