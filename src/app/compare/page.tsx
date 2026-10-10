import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CompareClient } from './CompareClient';
import { ChevronRight, Layers, ShieldCheck, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hardware Materials Spec Comparison Matrix | QrSlice',
  description: 'Compare physical specifications of Clear Acrylic Standees, Matte Black Metal Cards, Frost White PVC Cards, and Beechwood Blocks side-by-side.',
};

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-purple-600 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/products" className="hover:text-purple-600 transition">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">Materials Comparison</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Hardware Engineering Specifications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Compare Hardware Materials & Specifications
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every business has different aesthetic and operational demands. Compare material thickness, tap distance, environmental weather resistance, and pricing across our 4 core hardware formats.
          </p>
        </div>

        {/* Comparison Table */}
        <CompareClient />
      </main>

      <Footer />
    </div>
  );
}
