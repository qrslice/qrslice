import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Frequently Asked Questions — QrSlice Hardware',
  description: 'Everything you need to know about QrSlice NFC tap standees, laser engraving, phone compatibility, and order tracking.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'Do customers need an app to tap our NFC standees or cards?',
      a: 'No app is required! Modern smartphones (iPhones XR and newer, and almost all Android phones produced since 2017) have built-in background NFC reading. The customer simply touches their phone against the standee or card, and their browser automatically pops open the link.',
    },
    {
      q: 'What if a customer has an older phone without NFC?',
      a: 'Every QrSlice product is engineered with a high-contrast precision laser-engraved QR code as a universal fallback. Any smartphone camera will scan the QR code instantly.',
    },
    {
      q: 'Can I change my Google review link or menu URL after buying?',
      a: 'Yes! All QrSlice products are dynamically routed through your QrSlice account. You can log into your owner dashboard anytime and repoint your card or standee destination in seconds without reprinting or buying new hardware.',
    },
    {
      q: 'Does QrSlice do review gating (filtering negative reviews)?',
      a: 'No. QrSlice strictly complies with Google Maps and local business review policies. We never gate, filter, or suppress reviews. Our products provide a direct, seamless link to your official Google review dialog.',
    },
    {
      q: 'How long does Pan-India delivery take?',
      a: 'Custom laser engraving and UV printing take 24–48 hours. After dispatch, metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) receive orders in 2–3 business days. Rest of India takes 4–5 business days via BlueDart, Delhivery, or DTDC express.',
    },
    {
      q: 'Will I receive an invoice for my purchase / accounting?',
      a: 'Yes. All orders receive an official order invoice and commercial purchase receipt with full line-item details that you can download immediately after checkout and from your Account Orders portal. Please note that QRslice operates as an unregistered small business entity under GST law, so supplies are exempt from GST (0% tax charged, no Input Tax Credit).',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
            Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Everything you need to know about our physical NFC & QR hardware.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className={i > 0 ? 'pt-6' : ''}>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                {f.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
