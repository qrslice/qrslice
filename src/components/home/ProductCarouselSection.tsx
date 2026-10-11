'use client';

import React from 'react';
import Link from 'next/link';
import { ShopProduct } from '@/lib/shop-service';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  products: ShopProduct[];
  viewAllHref?: string;
}

export function ProductCarouselSection({
  title,
  subtitle,
  products,
  viewAllHref = '/products',
}: ProductCarouselSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 transition flex items-center gap-1 group shrink-0"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-violet-600" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
