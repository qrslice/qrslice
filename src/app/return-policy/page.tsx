import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Returns & Refund Policy — QrSlice',
  description: '1-Year replacement warranty, manufacturing defect replacements, and refund policies for customized hardware.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Returns & Refund Policy
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">Last updated: January 2026</p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">1. 1-Year Hardware Replacement Guarantee</h2>
          <p>
            All QrSlice products come with a 1-Year Limited Replacement Warranty against manufacturing defects, defective NFC microchips, or print peeling under normal operational indoor/outdoor restaurant and retail counter usage.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">2. Damaged in Transit or Defective Items</h2>
          <p>
            If your package arrives physically broken or defective, notify us within 48 hours of delivery at support@qrslice.com with a photo of the damaged piece. We will rush an express replacement at zero additional charge to you.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">3. Customized Products Policy</h2>
          <p>
            Because customized items are individually laser-etched and UV-printed with your business name and specific QR encoding, returns for non-defective customized items due to buyer change of mind cannot be restocked.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">4. Refund Processing</h2>
          <p>
            Where a refund is approved by our support team, refunds are processed directly back to the original payment source (credit/debit card, UPI, net banking) via Razorpay within 5–7 business days.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
