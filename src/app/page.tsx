import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { PromotionalHero } from '@/components/PromotionalHero';
import { TrustTicker } from '@/components/TrustTicker';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductCard } from '@/components/ProductCard';
import { HardwareShowcase } from '@/components/home/HardwareShowcase';
import { BenefitsStrip } from '@/components/BenefitsStrip';
import { Footer } from '@/components/Footer';
import { INITIAL_PRODUCTS } from '@/lib/shop-service';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  // Select the 6 featured products matching input_file_0.png
  const featuredProducts = INITIAL_PRODUCTS.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      {/* 1. Global Navigation Bar */}
      <Header />

      {/* Ticker marquee */}
      <TrustTicker />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 sm:space-y-12">
        {/* 2. Wide Promotional Hero with 4 Trust Badges */}
        <PromotionalHero />

        {/* 3. Horizontal 8-Category Navigation */}
        <section className="space-y-2">
          <CategoryNav />
        </section>

        {/* 4. Featured Products Section */}
        <section className="space-y-4 sm:space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-800 transition flex items-center gap-1 group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 6-Card Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 5. Interactive Hardware Showcase & Live Metrics (GSAP) */}
        <HardwareShowcase />

        {/* 6. Benefits Strip (Saturated Purple 5-Pillar Banner) */}
        <BenefitsStrip className="my-8" />
      </main>

      {/* 7. Comprehensive Footer */}
      <Footer />
    </div>
  );
}
