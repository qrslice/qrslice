import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VirtualNfcSimulator } from '@/components/demo/VirtualNfcSimulator';
import { ChevronRight, Zap, ShieldCheck, Award, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Interactive Virtual NFC Tap Simulator | QrSlice',
  description: 'Experience how contactless NFC tap cards and acrylic standees work on iPhone and Android. Test Google reviews, UPI payments, and digital business cards virtually.',
};

export default function TapSimulatorPage() {
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
          <span className="text-slate-900 font-bold">Virtual NFC Tap Simulator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Info */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Interactive Hardware Demo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Contactless Tap Works in Real Life
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every QrSlice product is precision-manufactured with an industrial NTAG213 contactless smart microchip and high-contrast laser QR code. When a customer brings their smartphone close, the action triggers instantly.
          </p>
        </div>

        {/* The Interactive Simulator Widget */}
        <VirtualNfcSimulator />

        {/* 3 Technical FAQ Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">Do customers need an app?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No app is ever required. Native NFC is built directly into modern iOS and NFC-enabled Android devices. Tapping opens Safari or Chrome natively.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">Does it need battery or charging?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero batteries or wires. The microchip is powered passively by the smartphone’s magnetic field during the contactless tap.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">What if a phone doesn&apos;t have NFC?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every standee and card features a high-resolution, laser-etched QR code as a universal fallback that works with any standard phone camera.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
