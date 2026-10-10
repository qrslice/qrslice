import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BulkOrdersClient } from './BulkOrdersClient';
import { ChevronRight, Building2, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bulk Corporate Kits & Multi-Card Customizer | QrSlice',
  description: 'Order 10 to 500+ customized NFC business cards, Google review standees, and UPI displays for your team or restaurant chain. Live CSV upload and volume discounts up to 35% OFF.',
};

export default function BulkOrdersPage() {
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
          <span className="text-slate-900 font-bold">Bulk & Corporate Orders</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Volume Pricing up to 35% OFF · B2B GST Invoicing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Corporate Team Kits & Multi-Location Hardware
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Equip your entire sales organization, hotel group, or restaurant franchise with custom laser-engraved NFC hardware. Upload your team roster via CSV or configure members directly below.
          </p>
        </div>

        {/* The Interactive Bulk Studio */}
        <BulkOrdersClient />
      </main>

      <Footer />
    </div>
  );
}
