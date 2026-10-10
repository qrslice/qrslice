'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRStudio } from '@/components/tools/QRStudio';
import { formatGoogleReviewUri } from '@/lib/qr-generator';
import { Star, ChevronRight, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function GoogleReviewQRPage() {
  const [businessName, setBusinessName] = useState('My Business');
  const [reviewInput, setReviewInput] = useState('https://g.page/r/example-review/review');
  const [showHelper, setShowHelper] = useState(false);

  const finalPayload = formatGoogleReviewUri(reviewInput);

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
          <Link href="/tools" className="hover:text-purple-600 transition">
            Free QR Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">Google Review QR Generator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Hero Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>100% Free · No Sign-Up Required</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free Google Review QR Code Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Generate high-resolution scannable QR codes that take customers directly to your Google Maps 5-star review page in one tap. Download in PNG or vector SVG format.
          </p>
        </div>

        {/* QR Studio */}
        <QRStudio
          initialPayload={finalPayload}
          defaultFrameText="REVIEW US ON GOOGLE"
          businessName={businessName}
          suggestedProductSlug="acrylic-google-review-standee"
          suggestedProductTitle="Countertop Acrylic Google Review Standee"
          suggestedProductPricePaise={69900}
          suggestedProductImage="/products/google-review-standee.png"
        >
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">1. Enter Business & Review Link</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Copper Chimney Bistro"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Google Review URL or Place ID *
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelper(!showHelper)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>How to get this?</span>
                </button>
              </div>

              <input
                type="text"
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                placeholder="https://g.page/r/... or ChIJ..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500">
                Tip: Use your direct short link (e.g. <span className="font-mono text-purple-700">https://g.page/r/your-id/review</span>) so the 5-star rating pop-up opens instantly.
              </p>
            </div>

            {showHelper && (
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-purple-900">How to find your direct review short link:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Open your Google Business Profile on Google Search.</li>
                  <li>Click on <strong>&quot;Ask for reviews&quot;</strong>.</li>
                  <li>Copy the provided short link (starts with <span className="font-mono text-purple-700">https://g.page/r/...</span>).</li>
                  <li>Paste it into the box above to generate your custom QR code.</li>
                </ol>
              </div>
            )}
          </div>
        </QRStudio>
      </main>

      <Footer />
    </div>
  );
}
