'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignInButton, UserButton, Show } from '@clerk/nextjs';
import { INITIAL_PRODUCTS, VerticalType, ShopProduct } from '@/lib/shop-service';
import { useCart } from '@/lib/cart-context';
import { BrandLogo } from '@/components/BrandLogo';

export function ShopClient() {
  const [selectedVertical, setSelectedVertical] = useState<VerticalType>('all');
  const { openCart, itemCount } = useCart();

  const verticals: { id: VerticalType; label: string; icon: string }[] = [
    { id: 'all', label: 'All Products', icon: '✨' },
    { id: 'salons', label: 'Salons & Spas', icon: '💇' },
    { id: 'retail', label: 'Retail & Boutiques', icon: '🛍️' },
    { id: 'clinics', label: 'Clinics & Healthcare', icon: '🩺' },
    { id: 'gyms', label: 'Gyms & Fitness', icon: '💪' },
    { id: 'cafes', label: 'Cafes & Hospitality', icon: '☕' },
    { id: 'corporate', label: 'Corporate & Founders', icon: '💼' },
  ];

  const filteredProducts = selectedVertical === 'all'
    ? INITIAL_PRODUCTS
    : INITIAL_PRODUCTS.filter((p) => p.vertical === selectedVertical || p.vertical === 'all');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo href="/" subtitle="Store" />

          <div className="flex items-center gap-3">
            <Link
              href="/activate"
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition"
            >
              Activate Card
            </Link>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/account/orders"
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 transition"
              >
                My Orders
              </Link>
              <Link
                href="/dashboard"
                className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition"
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white transition active:scale-95"
            >
              <span>🛒</span>
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-black text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-12 px-4 border-b border-zinc-800/60 bg-gradient-to-b from-zinc-900/40 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hardware-led Phygital Commerce · Guaranteed 1-Tap Launch
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Smart NFC Hardware for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Every Business.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Laser-engraved acrylic review standees, luxury matte metal cards, and eco-bamboo tap plaques. Collect reviews, drive bookings, and connect with customers in 1 second.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Free Shipping over ₹999
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Zero App Required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Instant Repointing Anytime
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> 100% Google Compliant
            </span>
          </div>
        </div>
      </section>

      {/* Category / Vertical Tabs */}
      <section className="max-w-6xl mx-auto px-4 pt-8 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {verticals.map((vert) => (
            <button
              key={vert.id}
              onClick={() => setSelectedVertical(vert.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedVertical === vert.id
                  ? 'bg-white text-zinc-950 shadow-md shadow-white/10'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{vert.icon}</span>
              <span>{vert.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      {/* Trust & Guarantee Band */}
      <section className="border-t border-zinc-800 bg-zinc-900/40 py-10 px-4 mt-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="text-2xl">⚡</div>
            <h3 className="text-sm font-bold text-white">Instant Tap Guarantee</h3>
            <p className="text-xs text-zinc-400">
              High-gain NTAG213 chips trigger instantly on iPhones and Androids without installing any app.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="text-2xl">🛡️</div>
            <h3 className="text-sm font-bold text-white">Forever Repointable</h3>
            <p className="text-xs text-zinc-400">
              Change your destination from Google reviews to your menu, socials, or booking site anytime in your dashboard.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="text-2xl">📦</div>
            <h3 className="text-sm font-bold text-white">Scratch-Off Claim PIN</h3>
            <p className="text-xs text-zinc-400">
              Each unit ships sealed with a one-time cryptographic PIN ensuring safe, verified restaurant/business activation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-4 text-center text-xs text-zinc-500">
        <p>QRslice Phygital Store · Delivering pan-India · Built for modern physical merchants.</p>
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700/80 transition-all duration-200 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-black/40">
      {/* Product Visual Mockup Container */}
      <div className="h-48 bg-zinc-950 p-6 flex items-center justify-center relative border-b border-zinc-800/80 group-hover:bg-zinc-900/80 transition">
        {product.badge && (
          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {product.badge}
          </span>
        )}

        <ProductVisualMockup category={product.category} slug={product.slug} />

        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded-md border border-zinc-800">
          <span>{product.finishes.length} Finishes</span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            {product.title}
          </h2>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="space-y-1.5 pt-1">
          {product.features.slice(0, 2).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
              <span className="text-emerald-400">✓</span>
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 block">Starting at</span>
            <span className="text-lg font-black text-white">
              ₹{(product.basePricePaise / 100).toLocaleString('en-IN')}
            </span>
          </div>

          <Link
            href={`/shop/${product.slug}`}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition active:scale-95 shadow-md shadow-white/5"
          >
            Customize →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductVisualMockup({ category, slug }: { category: string; slug: string }) {
  if (category === 'standees') {
    return (
      <div className="w-28 h-36 rounded-lg bg-zinc-900 border-2 border-zinc-700/80 shadow-2xl flex flex-col items-center justify-between p-2.5 transform -rotate-1 group-hover:rotate-0 transition-transform">
        <div className="w-full flex justify-between items-center text-[8px] text-zinc-400 font-bold">
          <span>GOOGLE REVIEW</span>
          <span className="text-emerald-400">TAP HERE</span>
        </div>
        <div className="w-12 h-12 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-mono text-[9px]">
          [QR]
        </div>
        <div className="w-full text-center">
          <span className="text-[9px] font-extrabold text-white tracking-wide">★★★★★</span>
        </div>
      </div>
    );
  }

  if (category === 'cards') {
    const isMetal = slug.includes('metal');
    return (
      <div
        className={`w-40 h-24 rounded-xl border shadow-2xl flex flex-col justify-between p-3 transform rotate-2 group-hover:rotate-0 transition-transform ${
          isMetal
            ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-zinc-700 text-zinc-200'
            : 'bg-[#c8ad8d] text-[#3e2723] border-[#8d6e63]'
        }`}
      >
        <div className="flex justify-between items-center text-[9px] font-extrabold tracking-wider">
          <span>{isMetal ? 'STEALTH METAL' : 'ECO BAMBOO'}</span>
          <span>NFC</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold">
            QS
          </div>
          <span className="text-[10px] font-bold tracking-tight">BRAND IDENTITY</span>
        </div>
        <div className="flex justify-between items-center text-[8px] opacity-75 font-mono">
          <span>TAP TO CONNECT</span>
          <span>NTAG213</span>
        </div>
      </div>
    );
  }

  if (category === 'plaques') {
    return (
      <div className="w-36 h-28 rounded-md bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-zinc-600 shadow-2xl p-2.5 flex flex-col items-center justify-around transform -rotate-2 group-hover:rotate-0 transition-transform">
        <span className="text-[9px] font-black text-zinc-200 tracking-wider">COUNTER DISPLAY</span>
        <div className="w-10 h-10 rounded-full border border-zinc-500 bg-zinc-950 flex items-center justify-center text-xs">
          📶
        </div>
        <span className="text-[8px] font-mono text-emerald-400">TAP TO FOLLOW / REVIEW</span>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-2xl flex flex-col items-center justify-center p-2 transform group-hover:scale-105 transition-transform">
      <span className="text-xl">🔑</span>
      <span className="text-[9px] font-bold text-zinc-300 mt-1">TAP TAG</span>
    </div>
  );
}
