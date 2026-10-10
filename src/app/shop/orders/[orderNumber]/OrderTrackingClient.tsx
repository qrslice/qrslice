'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';

export function OrderTrackingClient({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo href="/shop" subtitle="Order Tracking" />
          <Link
            href="/activate"
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition"
          >
            Go to Activation →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            ✓
          </div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Your custom smart NFC hardware is being queued for laser engraving.
          </p>
          <div className="inline-block px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200">
            Order Reference: <span className="font-bold text-white">{orderNumber}</span>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Fulfillment Progress
          </h3>

          <div className="relative border-l-2 border-emerald-500/40 ml-4 space-y-8 pl-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] flex items-center justify-center font-bold">
                ✓
              </span>
              <h4 className="text-sm font-bold text-white">Order Confirmed</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Payment received and customer branding logged into the manufacturing queue.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-400 animate-pulse" />
              <h4 className="text-sm font-bold text-emerald-400">Batch Generation & Laser Engraving</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Precision CNC laser engraving of business logo and NTAG213 cryptographic encoding.
              </p>
            </div>

            <div className="relative opacity-60">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700" />
              <h4 className="text-sm font-bold text-zinc-300">Courier Dispatch</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Sealed with silver scratch-off claim PIN and shipped via express courier with SMS tracking.
              </p>
            </div>

            <div className="relative opacity-60">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700" />
              <h4 className="text-sm font-bold text-zinc-300">Delivered & Ready to Tap</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Instant self-serve activation at /activate in 30 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* How to activate card callout */}
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">What happens upon delivery?</h3>
            <p className="text-xs text-zinc-400">
              Scratch off the silver PIN on the packaging sleeve, then claim your card in the Owner Portal.
            </p>
          </div>
          <Link
            href="/activate"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs whitespace-nowrap transition"
          >
            Preview Activation →
          </Link>
        </div>
      </main>
    </div>
  );
}
