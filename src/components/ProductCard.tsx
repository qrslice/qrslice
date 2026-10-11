'use client';

import React from 'react';
import Link from 'next/link';
import { ShopProduct } from '@/lib/shop-service';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { Star, ShoppingCart, Check, Heart } from 'lucide-react';

interface ProductCardProps {
  product: ShopProduct;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [justAdded, setJustAdded] = React.useState(false);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: product.image,
      quantity: 1,
      unitPricePaise: product.basePricePaise,
      finish: product.finishes[0] || {
        id: 'standard',
        name: 'Standard Finish',
        priceModifierPaise: 0,
        previewColor: '#ffffff',
      },
      customBusinessName: 'My Business',
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    openCart();
  };

  const getBadgeStyle = (badge?: string) => {
    const b = badge?.toLowerCase() || '';
    if (b === 'new') {
      return 'bg-violet-600 text-white font-black';
    }
    if (b.includes('dual') || b.includes('multi') || b.includes('combo')) {
      return 'bg-[#180C38] text-violet-200 border border-violet-500/40';
    }
    if (b.includes('pack') || b.includes('kit')) {
      return 'bg-slate-900 text-slate-100';
    }
    if (b.includes('steel') || b.includes('metal')) {
      return 'bg-slate-800 text-slate-100';
    }
    if (b.includes('bamboo') || b.includes('wood')) {
      return 'bg-[#78350F] text-amber-50';
    }
    return 'bg-violet-100 text-violet-800 border border-violet-200/80';
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-900/5 ${className}`}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getBadgeStyle(
              product.badge
            )}`}
          >
            {product.badge}
          </span>
        </div>
      )}

      {/* Wishlist Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-4 right-4 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-xs shadow-xs border ${
          isWishlisted
            ? 'border-rose-200 text-rose-500'
            : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
        }`}
        title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image Clickable Link */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100"
      >
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between pt-3">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        <div className="pt-2">
          {/* Price Row */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-purple-700">
              ₹{(product.basePricePaise / 100).toLocaleString('en-IN')}
            </span>
            {product.originalPricePaise && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">
                ₹{(product.originalPricePaise / 100).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Rating and Add to Cart Row */}
          <div className="flex items-center justify-between pt-1.5">
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewCount})</span>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">New</span>
            )}

            {/* Quick Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white shadow-xs'
              }`}
              title="Add to cart"
              aria-label={`Add ${product.title} to cart`}
            >
              {justAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
