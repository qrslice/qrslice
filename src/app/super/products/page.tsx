import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductsManagerClient } from './ProductsManagerClient';

export const metadata: Metadata = {
  title: 'Catalogue & Inventory | QRslice Superadmin',
  description: 'Physical hardware SKUs, stock levels, wholesale cost margins, and storefront publishing.',
};

export default function SuperProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading products...</div>}>
      <ProductsManagerClient />
    </Suspense>
  );
}
