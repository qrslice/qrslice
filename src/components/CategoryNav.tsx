'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, CategoryInfo } from '@/lib/shop-service';

interface CategoryNavProps {
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  className?: string;
}

export function CategoryNav({
  activeCategorySlug,
  onSelectCategory,
  className = '',
}: CategoryNavProps) {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3 min-w-[700px] md:min-w-0">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategorySlug === cat.slug;

          const CardContent = (
            <div
              className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center group h-[116px] select-none ${
                isActive
                  ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-600/30'
                  : 'border-slate-200/80 bg-white hover:border-purple-300 hover:bg-purple-50/20 hover:shadow-xs'
              }`}
            >
              {/* Category Image / Icon */}
              <div className="w-14 h-12 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Title */}
              <span
                className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 px-0.5 ${
                  isActive ? 'text-purple-700' : 'text-slate-800 group-hover:text-purple-700'
                }`}
              >
                {cat.shortName}
              </span>
            </div>
          );

          if (onSelectCategory) {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className="focus:outline-none"
              >
                {CardContent}
              </button>
            );
          }

          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="focus:outline-none"
            >
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
