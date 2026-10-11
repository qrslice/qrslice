import React from 'react';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { Header } from '@/components/Header';
import { HomeHero } from '@/components/home/HomeHero';
import { ActivateBox } from '@/components/home/ActivateBox';
import { HonestTrustStrip } from '@/components/home/HonestTrustStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductCarouselSection } from '@/components/home/ProductCarouselSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SmartHardwareDifferentiator } from '@/components/home/SmartHardwareDifferentiator';
import { BulkBand } from '@/components/home/BulkBand';
import { FaqTeaser } from '@/components/home/FaqTeaser';
import { Footer } from '@/components/Footer';
import { INITIAL_PRODUCTS } from '@/lib/shop-service';

export default function HomePage() {
  // 1. Featured Products from real product catalog
  const featuredProducts = INITIAL_PRODUCTS.filter((p) => p.isFeatured).slice(0, 6);

  // 2. New Arrivals (excluding any gifts-lifestyle)
  const newArrivalProducts = INITIAL_PRODUCTS.filter(
    (p) => !p.isFeatured && p.categorySlug !== 'gifts-lifestyle'
  ).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-violet-600 selection:text-white">
      {/* 1. Announcement Bar (One line, no hype) */}
      <AnnouncementBar />

      {/* 2. Global Navigation */}
      <Header />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 sm:space-y-16">
        {/* 3. Hero Section (Real product photography, ONE headline, ONE primary CTA) */}
        <HomeHero />

        {/* 4. Activate Box (Top of page card lookup) */}
        <ActivateBox />

        {/* 5. Honest Trust Strip (5 verified technical facts) */}
        <HonestTrustStrip />

        {/* 6. 7-Category Growth Grid */}
        <CategoryGrid />

        {/* 7. Featured Hardware Section */}
        <ProductCarouselSection
          title="Featured Hardware"
          subtitle="Precision-engraved standees and smart contactless cards for front desks and dining tables."
          products={featuredProducts}
          viewAllHref="/products"
        />

        {/* 8. How It Works (3 clear, honest steps) */}
        <HowItWorks />

        {/* 9. Smart Hardware Differentiator (Cloud link management & feedback inbox) */}
        <SmartHardwareDifferentiator />

        {/* 9. New Arrivals Section */}
        <ProductCarouselSection
          title="New Arrivals"
          subtitle="Recent additions to our physical contactless catalog."
          products={newArrivalProducts}
          viewAllHref="/products"
        />

        {/* 10. Bulk / B2B Band */}
        <BulkBand />

        {/* 11. FAQ Teaser */}
        <FaqTeaser />
      </main>

      {/* 12. Honest Footer */}
      <Footer />
    </div>
  );
}
