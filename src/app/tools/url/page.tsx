'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRStudio } from '@/components/tools/QRStudio';
import { ChevronRight, Globe, Link2, ExternalLink } from 'lucide-react';

export default function UrlQRPage() {
  const [url, setUrl] = useState('https://qrslice.com');
  const [businessName, setBusinessName] = useState('My Brand');

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
          <span className="text-slate-900 font-bold">Website & URL QR Generator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Hero Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Universal Link QR · Works with Any Web Page, PDF or Store</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free Website & Link QR Code Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Convert any website URL, online menu, product brochure, Linktree, or portfolio into a high-resolution scannable QR code. Download free in PNG or scalable vector SVG.
          </p>
        </div>

        {/* QR Studio */}
        <QRStudio
          initialPayload={url || 'https://qrslice.com'}
          defaultFrameText="SCAN TO VISIT WEBSITE"
          businessName={businessName}
          suggestedProductSlug="solid-wood-menu-qr-block"
          suggestedProductTitle="Solid Wood Tabletop QR Block Standee"
          suggestedProductPricePaise={49900}
          suggestedProductImage="/products/wood-qr-block.png"
        >
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">1. Enter Website or Link Destination</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Destination Website URL *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-slate-500">
                You can link to your homepage, Shopify catalog, PDF menu, Google Drive file, or booking calendar.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Brand or Company Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Copper Chimney Bistro"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>
        </QRStudio>
      </main>

      <Footer />
    </div>
  );
}
