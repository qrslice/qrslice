'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { INITIAL_PRODUCTS, ShopProduct } from '@/lib/shop-service';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, ShoppingCart } from 'lucide-react';

export default function WishlistPage() {
  const { items, toggleWishlist, clearWishlist } = useWishlist();
  const { addItem, openCart } = useCart();

  const wishlistedProducts: ShopProduct[] = items
    .map((id) => INITIAL_PRODUCTS.find((p) => p.id === id))
    .filter((p): p is ShopProduct => p !== undefined);

  const handleAddToCart = (product: ShopProduct) => {
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
    openCart();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Saved Wishlist</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-bold">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of physical NFC displays, review standees, and custom cards for your business.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition w-fit"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore our catalog and click the heart icon on any product to save it for quick ordering later.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-purple-200 transition group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-4/3 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-3">
                  <Link href={`/products/${product.slug}`}>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">{product.rating}</span>
                  <span>({product.reviewCount})</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <div>
                  <span className="text-sm font-black text-purple-700">
                    ₹{(product.basePricePaise / 100).toLocaleString('en-IN')}
                  </span>
                  {product.originalPricePaise && (
                    <span className="text-[11px] text-slate-400 line-through ml-1.5 font-medium">
                      ₹{(product.originalPricePaise / 100).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shadow-purple-600/20 active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
