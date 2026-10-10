import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service — QrSlice',
  description: 'Terms and conditions governing the purchase and usage of QrSlice physical hardware and routing layer.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">Last updated: January 2026</p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">1. Agreement to Terms</h2>
          <p>
            By accessing QrSlice.com or purchasing our NFC/QR hardware products, you agree to be bound by these Terms of Service and all applicable laws of India. QrSlice provides one-time hardware products with zero recurring subscription fees.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">2. Acceptable Use of Routing</h2>
          <p>
            Merchants agree not to point QR or NFC destinations to malicious phishing URLs, malware, unauthorized copyright infringing content, or illegal schemes. QrSlice reserves the right to disable destination routing for any card or standee violating these standards.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">3. Hardware Intellectual Property</h2>
          <p>
            The physical designs, circuitry, and firmware in QrSlice hardware products are proprietary to QRslice. You retain all rights to your own uploaded business logos and brand artwork.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-2">4. Jurisdiction</h2>
          <p>
            Any disputes arising under these terms are governed by the laws of India, subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
