'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRStudio } from '@/components/tools/QRStudio';
import { formatWifiUri } from '@/lib/qr-generator';
import { ChevronRight, Wifi, ShieldCheck, Lock } from 'lucide-react';

export default function WifiQRPage() {
  const [ssid, setSsid] = useState('Guest_WiFi_5G');
  const [password, setPassword] = useState('Welcome2026');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);

  const finalPayload = formatWifiUri({
    ssid,
    password: encryption === 'nopass' ? '' : password,
    encryption,
    hidden,
  });

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
          <span className="text-slate-900 font-bold">WiFi Connect QR Generator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Hero Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Instant Auto-Connect · No Password Typing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free WiFi QR Code Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Create an auto-connect WiFi QR code for your cafe, restaurant, Airbnb, clinic, or office. Guests scan the code with their camera to connect instantly without typing complex passwords.
          </p>
        </div>

        {/* QR Studio */}
        <QRStudio
          initialPayload={finalPayload}
          defaultFrameText="SCAN TO CONNECT TO WIFI"
          businessName={ssid}
          suggestedProductSlug="solid-wood-menu-qr-block"
          suggestedProductTitle="Natural Wood Tabletop QR Block Standee"
          suggestedProductPricePaise={49900}
          suggestedProductImage="/products/wood-qr-block.png"
        >
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">1. Enter WiFi Network Details</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Network Name (SSID) *
              </label>
              <input
                type="text"
                required
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="e.g. Blue_Tokai_Guest"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Security Encryption
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'WPA', label: 'WPA / WPA2' },
                  { id: 'WEP', label: 'WEP' },
                  { id: 'nopass', label: 'Open (No Pass)' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setEncryption(sec.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      encryption === sec.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            {encryption !== 'nopass' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  WiFi Password *
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your WiFi password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hiddenNetwork"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="hiddenNetwork" className="text-xs font-medium text-slate-700 cursor-pointer">
                This is a hidden network
              </label>
            </div>
          </div>
        </QRStudio>
      </main>

      <Footer />
    </div>
  );
}
