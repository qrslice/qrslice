import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrackOrderClient } from './TrackOrderClient';
import { ChevronRight, Truck, ShieldCheck, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Track Hardware Manufacturing & Order Status | QrSlice',
  description: 'Track the real-time laser engraving proof, NTAG213 chip encoding, and Bluedart express courier status of your QrSlice custom hardware order. Download tax invoices.',
};

export default function TrackOrderPage() {
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
          <Link href="/account/orders" className="hover:text-purple-600 transition">
            Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">Track Order</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <TrackOrderClient />
      </main>

      <Footer />
    </div>
  );
}
