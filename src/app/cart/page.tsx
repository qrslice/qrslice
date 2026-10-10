'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    totalPaise,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const freeShippingThresholdPaise = 99900;
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdPaise - subtotalPaise);
  const freeShippingProgress = Math.min(100, Math.round((subtotalPaise / freeShippingThresholdPaise) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your customized NFC and QR products before checkout.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-800 transition"
          >
            ← Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/90 shadow-xs max-w-xl mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center text-3xl">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t added any products yet. Check out our bestselling Google review standees and NFC business cards!
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition active:scale-95"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Strip */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>
                      {remainingForFreeShipping > 0
                        ? `Add ₹${(remainingForFreeShipping / 100).toFixed(0)} more for FREE Express Delivery`
                        : 'You have unlocked FREE Pan-India Express Delivery! 🎉'}
                    </span>
                  </div>
                  <span className="text-purple-700">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-purple-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-2xl">🏷️</span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-bold text-slate-900 hover:text-purple-600 transition block truncate"
                        >
                          {item.title}
                        </Link>
                        {item.finish && (
                          <p className="text-xs text-slate-500">
                            Finish: <span className="font-semibold text-slate-700">{item.finish.name}</span>
                          </p>
                        )}
                        {item.customBusinessName && (
                          <p className="text-xs text-purple-700 font-semibold truncate">
                            Branding: &quot;{item.customBusinessName}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-black"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="text-sm font-black text-slate-900 min-w-[70px] text-right">
                        ₹{((item.unitPricePaise * item.quantity) / 100).toLocaleString('en-IN')}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              {/* Coupon Block */}
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        %
                      </span>
                      <div>
                        <p className="text-xs font-bold text-purple-900">{appliedCoupon.code} Applied</p>
                        <p className="text-[11px] text-purple-700">
                          {appliedCoupon.description} (-₹{(discountPaise / 100).toLocaleString('en-IN')})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-white transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem('coupon') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          applyCoupon(input.value);
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        name="coupon"
                        type="text"
                        placeholder="Coupon Code"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-hidden focus:border-purple-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                      >
                        Apply
                      </button>
                    </form>
                    {couponError && (
                      <p className="text-[11px] text-red-600 font-medium mt-1.5">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-slate-900 font-bold">
                    ₹{(subtotalPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                {discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{(discountPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Pan-India Delivery</span>
                  <span>
                    {shippingPaise === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${(shippingPaise / 100).toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Laser Setup & QC Check</span>
                  <span className="text-emerald-600 font-bold">Included</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-black text-slate-900">
                  <span>Final Total</span>
                  <span className="text-purple-700">
                    ₹{(totalPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Razorpay 256-bit Secure Gateway</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
