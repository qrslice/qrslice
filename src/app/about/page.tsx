import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';

export const metadata = {
  title: 'About QrSlice — Physical Products for Modern Businesses',
  description: 'QrSlice designs and manufactures precision-engineered NFC and QR hardware for Indian restaurants, cafes, salons, clinics and modern retail.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
            About QrSlice
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The Restaurant & Retail QR Layer
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            We bridge physical spaces and digital engagement with laser-crafted NFC standees, luxury cards, and smart displays.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">Hardware-Led, Software-Retained</h2>
          <p>
            QrSlice was founded to give retail merchants, restaurant owners, and professionals tangible, high-grade physical touchpoints that drive measurable digital results: more 5-star Google reviews, effortless contactless menus, fast UPI payments, and instant digital business card sharing.
          </p>
          <p>
            Unlike flimsy printed paper stickers that fade and rip, every QrSlice hardware piece is fabricated from architectural acrylic, solid sustainable beechwood, or aerospace stainless steel with embedded NTAG213 NFC microchips engineered for long-term commercial durability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-xs">Precision Manufacturing</h3>
              <p className="text-[11px] text-slate-500">In-house laser engraving and high-res UV flatbed printing.</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
              <Truck className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-xs">Pan-India Reach</h3>
              <p className="text-[11px] text-slate-500">Fast express delivery across all 28 states and union territories.</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-xs">Dynamic Repointing</h3>
              <p className="text-[11px] text-slate-500">Change your destination link anytime without re-printing.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
