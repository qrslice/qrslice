'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Package,
  Truck,
  Sparkles,
  ArrowRight,
  Boxes,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function PromotionalHero() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        gsap.set('.hero-pill, .hero-title-line, .hero-subheading, .hero-cta-btn, .hero-trust-item, .hero-image-card', {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          clearProps: 'opacity,transform',
        });
        return;
      }

      // 1. Ambient lighting fluid drift
      gsap.to('.hero-glow-1', {
        x: 40,
        y: -30,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.hero-glow-2', {
        x: -30,
        y: 25,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 2. Cinematic Staggered Entrance
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-pill', {
        opacity: 0,
        y: -20,
        duration: 0.6,
      })
        .from(
          '.hero-title-line',
          {
            opacity: 0,
            y: 35,
            stagger: 0.12,
            duration: 0.8,
          },
          '-=0.3'
        )
        .from(
          '.hero-subheading',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta-btn',
          {
            opacity: 0,
            scale: 0.92,
            stagger: 0.1,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-trust-item',
          {
            opacity: 0,
            x: -15,
            stagger: 0.08,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-image-card',
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.9,
            ease: 'back.out(1.4)',
          },
          '-=0.6'
        );

      // 3. Gentle Continuous Floating Simulation
      gsap.to('.hero-image-card', {
        y: -10,
        rotation: 0.8,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.hero-floating-badge', {
        y: 6,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4,
      });

      // 4. ~1.5s Safety fallback: force reveal anything still hidden
      const safetyTimer = setTimeout(() => {
        gsap.set('.hero-pill, .hero-title-line, .hero-subheading, .hero-cta-btn, .hero-trust-item, .hero-image-card', {
          opacity: 1,
          clearProps: 'opacity',
        });
      }, 1500);

      return () => clearTimeout(safetyTimer);
    },
    { scope: containerRef }
  );

  // Mouse tilt interaction with GSAP quickTo
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power1.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power2.out',
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl border border-purple-100/90 bg-gradient-to-r from-purple-50/70 via-white to-purple-100/50 shadow-xs"
    >
      {/* Background ambient lighting */}
      <div className="hero-glow-1 absolute -top-24 -right-24 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="hero-glow-2 absolute -bottom-24 -left-24 w-72 h-72 bg-purple-100/50 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy & Trust Indicators */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Tag */}
            <div className="hero-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/70 text-purple-700 text-xs font-bold tracking-wider uppercase">
              <Package className="w-3.5 h-3.5" />
              <span>Physical Hardware · Tap & Scan</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              <span className="hero-title-line block">Smart NFC & QR Products</span>
              <span className="hero-title-line block text-purple-700">for Modern Businesses</span>
            </h1>

            {/* Subheading */}
            <p className="hero-subheading text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Boost Google reviews, grow followers, and accept zero-fee UPI payments with premium, laser-engraved acrylic and matte black metal hardware.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/products"
                className="hero-cta-btn px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/35 active:scale-95 flex items-center gap-2"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools"
                className="hero-cta-btn px-5 py-3 rounded-2xl bg-white hover:bg-purple-50 text-purple-700 font-bold text-sm border border-purple-200 transition-all shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Free QR Studio</span>
              </Link>
              <Link
                href="/products?category=bulk-orders"
                className="hero-cta-btn px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all shadow-xs"
              >
                Bulk Enterprise Kits
              </Link>
            </div>

            {/* 4 Trust Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-purple-100/80">
              <div className="hero-trust-item flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  Premium Quality<br />Materials
                </div>
              </div>

              <div className="hero-trust-item flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  Custom Branding<br />Available
                </div>
              </div>

              <div className="hero-trust-item flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  Bulk Orders<br />for Businesses
                </div>
              </div>

              <div className="hero-trust-item flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  Pan India<br />Express Shipping
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Product Showcase with 3D Hover & Float */}
          <div
            className="lg:col-span-5 flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={cardRef}
              className="hero-image-card relative w-full max-w-lg transition-shadow duration-300 select-none will-change-transform"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-100 bg-white">
                <img
                  src="/hero/hero-products.png"
                  alt="QrSlice Smart NFC & QR Hardware Display"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Floating verified badge */}
              <div className="hero-floating-badge absolute -bottom-3 -left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  Live NFC NTAG213 Embedded
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
