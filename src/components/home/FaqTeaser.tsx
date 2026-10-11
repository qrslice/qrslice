import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';

export function FaqTeaser() {
  const faqs = [
    {
      q: 'Do customers need to download an app?',
      a: 'No. Contactless NFC triggers natively on both iOS and Android. Customers simply tap their phone, or scan the backup laser-etched QR code using their standard phone camera.',
    },
    {
      q: 'Can I change my destination link after the card is printed?',
      a: 'Yes. Every hardware piece links through your free QRslice cloud dashboard. You can re-point any card or standee to a new Google Review link, menu, or Instagram handle anytime with zero reprinting.',
    },
    {
      q: 'How durable is the hardware in a restaurant environment?',
      a: 'Our standees use 3mm industrial cast acrylic, solid wood bases, or stainless steel plates. The embedded NTAG213 chips are waterproof, require no batteries, and carry a 1-year replacement warranty.',
    },
    {
      q: 'What are the delivery charges and transit times?',
      a: 'Custom laser engraving takes 24–48 hours. Express courier delivery takes 3–5 business days across India. Shipping is completely free on all orders over ₹999.',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-violet-800 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-violet-600" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real operational answers. No fluff or technical jargon.
          </p>
        </div>

        <Link
          href="/faq"
          className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 transition flex items-center gap-1 group shrink-0"
        >
          <span>View all FAQs</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-violet-600" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
          >
            <h3 className="text-sm font-bold text-slate-900">
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
