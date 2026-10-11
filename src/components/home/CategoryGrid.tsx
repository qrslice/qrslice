'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/shop-service';
import { ArrowRight } from 'lucide-react';

export function CategoryGrid() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hardware engineered for front desks, dining tables, counters, and networking.
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 transition flex items-center gap-1 group"
        >
          <span>All products</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-violet-600" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-900/5 transition-all text-center select-none"
          >
            <div className="w-full aspect-square max-w-[80px] mx-auto flex items-center justify-center p-2 mb-2 transition-transform duration-200 group-hover:scale-105">
              <img
                src={cat.image}
                alt={cat.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight">
                {cat.shortName}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
