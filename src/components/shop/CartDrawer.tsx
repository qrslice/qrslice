'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
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

  if (!isOpen) return null;

  const freeShippingThresholdPaise = 99900;
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdPaise - subtotalPaise);
  const freeShippingProgress = Math.min(100, Math.round((subtotalPaise / freeShippingThresholdPaise) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F0728]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white border-l border-slate-200 text-slate-900 flex flex-col h-full shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 border border-violet-200/80 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
              <p className="text-xs text-slate-500 font-medium">
                {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress banner */}
        <div className="px-5 py-3.5 bg-violet-50/70 border-b border-violet-100 text-xs">
          {remainingForFreeShipping > 0 ? (
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-violet-600 shrink-0" />
              <p className="text-slate-700 font-medium">
                Add <span className="text-violet-700 font-bold">₹{(remainingForFreeShipping / 100).toFixed(0)}</span> more for <span className="font-bold text-slate-900">FREE Express Delivery</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 text-violet-800 font-bold">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You have unlocked FREE Pan-India Delivery!</span>
            </div>
          )}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-200/80 flex items-center justify-center text-violet-700 mb-3.5">
                <ShoppingBag className="w-8 h-8 text-violet-600" />
              </div>
              <p className="text-slate-800 font-bold text-base mb-1">Your cart is empty</p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs">
                Explore our smart NFC tap standees, review collectors, and smart cards
              </p>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex gap-3 hover:border-violet-500/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xl">🏷️</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug truncate max-w-[200px]">
                        {item.title}
                      </h3>
                      {item.finish && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.finish.name}
                        </p>
                      )}
                      {item.customBusinessName && (
                        <p className="text-[11px] text-violet-700 font-semibold mt-0.5 truncate max-w-[190px]">
                          &quot;{item.customBusinessName}&quot;
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-0.5 text-slate-600 hover:text-slate-900 text-xs font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-0.5 text-xs font-bold text-slate-900 min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-0.5 text-slate-600 hover:text-slate-900 text-xs font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{((item.unitPricePaise * item.quantity) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-white space-y-4">
            {/* Coupon Code Section */}
            <div className="bg-violet-50/70 p-3 rounded-xl border border-violet-200/80">
              {appliedCoupon ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                      %
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{appliedCoupon.code} Applied</p>
                      <p className="text-[11px] text-violet-700 font-medium">
                        {appliedCoupon.description} (-₹{(discountPaise / 100).toLocaleString('en-IN')})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-white transition"
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
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition shrink-0 active:scale-95 shadow-xs"
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

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{(discountPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>
                  {shippingPaise === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${(shippingPaise / 100).toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-violet-900 font-black">₹{(totalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/20 active:scale-[0.98] text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-violet-200" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-center block transition text-xs"
              >
                View Full Cart
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Official Razorpay 256-bit Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
