'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  RotateCw,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Award,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function HardwareShowcase() {
  const containerRef = useRef<HTMLElement>(null);
  const count1Ref = useRef<HTMLSpanElement>(null);
  const count2Ref = useRef<HTMLSpanElement>(null);
  const count3Ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      // Check prefers-reduced-motion
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Safety reveal timeout (1.5s)
      const timer = setTimeout(() => {
        gsap.set('.hardware-card', { opacity: 1, y: 0, clearProps: 'opacity,transform' });
      }, 1500);

      // 1. Entrance timeline for cards as progressive enhancement
      gsap.fromTo(
        '.hardware-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            clearTimeout(timer);
          },
        }
      );

      return () => clearTimeout(timer);
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="space-y-8 py-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Industrial Engineering</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Modern Businesses Choose QrSlice Physical Hardware
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminate flimsy paper QR printouts. Turn every counter and interaction into a premium, high-converting customer touchpoint.
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-800 transition flex items-center gap-1 group shrink-0"
        >
          <span>Explore All 24+ Hardware SKUs</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 3 Pillar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Contactless NFC */}
        <div className="hardware-card bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
              Instant Contactless NFC Tap
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
              Embedded NTAG213 high-frequency smart chip triggers instant actions. Customers tap their iPhone or Android without opening an app or camera.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-purple-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Works with NFC-enabled smartphones</span>
          </div>
        </div>

        {/* Pillar 2: Industrial Materials */}
        <div className="hardware-card bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              5mm Acrylic & Matte Laser Steel
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
              Engineered for busy restaurants and retail counters. Scratch-resistant, waterproof, UV-stable, and mounted on natural solid oak bases that stay upright.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spill-proof & 1-Year replacement warranty</span>
          </div>
        </div>

        {/* Pillar 3: Dynamic Cloud Re-Pointing */}
        <div className="hardware-card bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
            <RotateCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
              Cloud Repointing Anytime
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
              Never reprint hardware when you change links. Re-route your review URL, payment destination, or digital menu anytime from your personal account dashboard.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>One-time hardware · Zero recurring fees</span>
          </div>
        </div>
      </div>

      {/* Honest Operational Guarantees Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div className="space-y-1">
          <span className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            100%
          </span>
          <p className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            Custom Laser Engraved
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-2xl sm:text-4xl font-black text-amber-300 tracking-tight">
            1 Year
          </span>
          <p className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            Hardware Warranty
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-2xl sm:text-4xl font-black text-emerald-400 tracking-tight">
            0%
          </span>
          <p className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            UPI Commission Fees
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Air Express
          </span>
          <p className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            Pan-India Delivery
          </p>
        </div>
      </div>
    </section>
  );
}
