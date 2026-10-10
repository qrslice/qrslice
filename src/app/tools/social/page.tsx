'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRStudio } from '@/components/tools/QRStudio';
import { formatSocialUri } from '@/lib/qr-generator';
import { ChevronRight, Phone, Share2, Video, Globe } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4 text-pink-600' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4 text-red-600' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4 text-blue-600' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon({ className = 'w-4 h-4 text-slate-800' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function SocialQRPage() {
  const [platform, setPlatform] = useState<'instagram' | 'youtube' | 'x' | 'linkedin'>('instagram');
  const [handle, setHandle] = useState('qrslice');
  const [businessName, setBusinessName] = useState('My Brand');

  const finalPayload = formatSocialUri(platform, handle);

  const getFrameDefault = () => {
    switch (platform) {
      case 'instagram':
        return 'FOLLOW US ON INSTAGRAM';
      case 'youtube':
        return 'SUBSCRIBE ON YOUTUBE';
      case 'x':
        return 'FOLLOW US ON X';
      case 'linkedin':
        return 'CONNECT ON LINKEDIN';
    }
  };

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
          <span className="text-slate-900 font-bold">Social Media Follow QR Generator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Hero Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-xs font-bold">
            <Share2 className="w-3.5 h-3.5" />
            <span>Grow Social Followers & Direct Customer Engagement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free Social Media Follow QR Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Convert walk-in store visitors into loyal social media followers. Generate instant scan-to-follow QR codes for Instagram, YouTube, X (Twitter), and LinkedIn.
          </p>
        </div>

        {/* QR Studio */}
        <QRStudio
          initialPayload={finalPayload}
          defaultFrameText={getFrameDefault()}
          businessName={businessName}
          suggestedProductSlug="instagram-follow-nfc-standee"
          suggestedProductTitle="Acrylic Instagram Follow NFC Standee"
          suggestedProductPricePaise={69900}
          suggestedProductImage="/products/instagram-follow-standee.png"
        >
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">1. Select Social Platform</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'instagram', label: 'Instagram', icon: InstagramIcon, color: 'text-pink-600' },
                { id: 'youtube', label: 'YouTube', icon: YoutubeIcon, color: 'text-red-600' },
                { id: 'x', label: 'X (Twitter)', icon: XIcon, color: 'text-slate-900' },
                { id: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-600' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlatform(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      platform === item.id
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 block">
                {platform === 'x' ? 'X (Twitter) Handle / Username *' : `${platform.charAt(0).toUpperCase() + platform.slice(1)} Username / Handle *`}
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Generated Target: <span className="font-mono text-purple-700 font-bold">{finalPayload}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Brand or Store Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Copper Chimney"
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
