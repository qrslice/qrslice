'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
} from 'lucide-react';

export function TrustTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = tickerRef.current;
      if (!el) return;

      const totalWidth = el.scrollWidth / 2;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Infinite smooth GSAP marquee animation
      gsap.to(el, {
        x: -totalWidth,
        duration: 32,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope: tickerRef }
  );

  const items = [
    { label: 'NTAG213 Smart Contactless NFC', icon: Zap },
    { label: 'Zero Transaction / POS Fees', icon: Award },
    { label: 'Laser-Etched Acrylic & Matte Black Metal', icon: Sparkles },
    { label: 'Universal Camera QR (No App Required)', icon: ShieldCheck },
    { label: 'Pan-India Express Dispatch', icon: Truck },
    { label: '1-Year Free Hardware Replacement', icon: RotateCcw },
    { label: 'Instant Cloud Destination Re-Pointing', icon: Zap },
  ];

  return (
    <div className="w-full overflow-hidden bg-purple-950 text-white py-3 border-y border-purple-800/60 select-none">
      <div
        ref={tickerRef}
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
      >
        {/* Render 2 sets to make the infinite loop seamless */}
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 text-xs font-bold tracking-wider uppercase text-purple-100"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <Icon className="w-3.5 h-3.5 text-purple-300" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
