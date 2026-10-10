import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy — QrSlice',
  description: 'How QrSlice collects, protects, and handles customer order data and dynamic NFC destination configurations.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">Last updated: January 2026</p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">1. Information We Collect</h2>
          <p>
            When you purchase hardware from QrSlice, we collect information necessary to fulfill your order, including your name, business name, shipping address, email address, phone number, and custom QR URLs.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">2. Payment Security</h2>
          <p>
            We never store your payment card numbers, CVVs, or bank net banking credentials on our servers. All financial transactions are securely processed through Razorpay using industry-standard 256-bit SSL encryption adhering to PCI-DSS Level 1 compliance.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">3. Tap Data & Destination Privacy</h2>
          <p>
            When customers tap your physical standees or cards, we route them directly to your designated destination link. We do not sell customer tap data or track personal customer browsing behavior.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">4. Data Sharing</h2>
          <p>
            We only share your shipping details with verified courier logistics partners (BlueDart, Delhivery, DTDC) exclusively to fulfill shipment delivery to your door.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
