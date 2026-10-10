import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Shipping & Delivery Policy — QrSlice',
  description: 'Pan-India shipping rates, dispatch times, courier tracking, and free shipping conditions.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">Last updated: January 2026</p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">1. Pan-India Delivery Coverage</h2>
          <p>
            QrSlice ships to all serviceable pincodes across India via premier air express courier partners including BlueDart, Delhivery, DTDC, and India Post Speed Post.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">2. Shipping Charges</h2>
          <p>
            • Orders of ₹999 and above qualify for <strong>FREE Pan-India Express Delivery</strong>.<br />
            • Orders below ₹999 incur a flat nominal shipping fee of ₹79 anywhere in India.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">3. Production & Dispatch Timelines</h2>
          <p>
            Because each hardware unit involves customized laser engraving and QR printing with your business name, production takes 24–48 hours from the time order verification is completed. Once dispatched, live tracking status is viewable directly in your Account Orders and Track Order portal.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">4. Estimated Delivery Days</h2>
          <p>
            • Metro Cities (Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata, Pune): 2–3 business days post dispatch.<br />
            • Tier 2 / Tier 3 Cities and Regional Districts: 3–5 business days post dispatch.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
