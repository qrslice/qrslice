import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#0F0728] text-white border border-[#261447] shadow-xl">
      {/* Subtle brand ambient accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Clear, Honest Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Commercial Hardware · NFC + QR</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Turn every in-person customer into a 5-star Google review.
            </h1>

            <p className="text-base sm:text-lg text-violet-200/80 leading-relaxed max-w-xl">
              Laser-etched acrylic and metal NFC standees and tap cards. Customers tap or scan. No app required. Free cloud dashboard included with every device.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products"
                className="px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-600/30 active:scale-[0.98] flex items-center gap-2"
              >
                <span>Shop the catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bulk-orders"
                className="px-5 py-3.5 rounded-2xl bg-[#1E0F45] hover:bg-[#2A155F] text-violet-100 font-semibold text-sm border border-violet-500/30 transition-all active:scale-[0.98]"
              >
                Explore bulk packs
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-[#261447] text-xs text-violet-300/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span>1-year hardware warranty</span>
              </div>
              <span className="text-violet-800">•</span>
              <span>Dispatched in 24–48 hours</span>
              <span className="text-violet-800">•</span>
              <span>Zero monthly fees</span>
            </div>
          </div>

          {/* Right Column: Real Product Photography */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl bg-[#180C38] border border-[#2D1660] p-6 sm:p-8 flex items-center justify-center shadow-2xl overflow-hidden">
              <img
                src="/hero/hero-products.png"
                alt="QRslice NFC and QR Google Review Standees and Smart Business Cards"
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
