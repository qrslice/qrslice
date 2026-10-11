import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolsHubStudio } from '@/components/tools/ToolsHubStudio';
import {
  Star,
  CreditCard,
  Wifi,
  User,
  Globe,
  Share2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Download,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free QR Code Generator Studio & Tools | QrSlice',
  description: 'Generate 100% free high-resolution QR codes for Google Reviews, UPI Payments, WiFi, Digital Business Cards, Websites, and Social Media. Free PNG and vector SVG export.',
};

export default function ToolsHubPage() {
  const tools = [
    {
      id: 'google-review',
      title: 'Google Review QR Generator',
      description: 'Create a direct link QR code that opens your Google Maps 5-star review box in 1 tap.',
      icon: Star,
      iconColor: 'text-amber-500 bg-amber-500/10',
      badge: 'Most Popular',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      href: '/tools/google-review',
      matchingHardware: 'Acrylic Google Review Standee',
    },
    {
      id: 'upi-payment',
      title: 'UPI Payment QR Generator',
      description: 'NPCI-compliant Indian UPI QR code. Accept payments via GPay, PhonePe, Paytm, and BHIM with 0% fee.',
      icon: CreditCard,
      iconColor: 'text-emerald-500 bg-emerald-500/10',
      badge: 'Zero Fees',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      href: '/tools/upi-payment',
      matchingHardware: 'Dual-QR Countertop UPI Standee',
    },
    {
      id: 'wifi',
      title: 'WiFi Connect QR Generator',
      description: 'Allow guests to connect to your cafe, clinic, or hotel WiFi without typing passwords.',
      icon: Wifi,
      iconColor: 'text-blue-500 bg-blue-500/10',
      badge: 'Instant Connect',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      href: '/tools/wifi',
      matchingHardware: 'Wooden Tabletop WiFi Block',
    },
    {
      id: 'vcard',
      title: 'Digital Business Card (vCard)',
      description: 'Generate a vCard 3.0 QR code that instantly saves your contact into phone address books.',
      icon: User,
      iconColor: 'text-violet-500 bg-violet-500/10',
      badge: 'Networking',
      badgeColor: 'bg-violet-100 text-violet-900 border-violet-200',
      href: '/tools/vcard',
      matchingHardware: 'Matte Black Metal NFC Card',
    },
    {
      id: 'url',
      title: 'Website & Link QR Generator',
      description: 'Universal link QR code for your homepage, menu PDF, Linktree, product brochure, or store.',
      icon: Globe,
      iconColor: 'text-indigo-500 bg-indigo-500/10',
      badge: 'Universal',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      href: '/tools/url',
      matchingHardware: 'Acrylic QR Counter Standee',
    },
    {
      id: 'social',
      title: 'Social Media Follow QR',
      description: 'Boost store visitors into followers on Instagram, YouTube, X (Twitter), and LinkedIn.',
      icon: Share2,
      iconColor: 'text-pink-500 bg-pink-500/10',
      badge: 'Grow Followers',
      badgeColor: 'bg-pink-100 text-pink-900 border-pink-200',
      href: '/tools/social',
      matchingHardware: 'Instagram Follow NFC Standee',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-violet-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/90 text-violet-800 text-xs font-bold border border-violet-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>100% Free · No Sign-Up Required · Instant Vector SVG & PNG Export</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0F0728] tracking-tight">
            Free QR Code Generator Studio
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Design instant, high-contrast QR codes for your storefront, tables, or counter. Customize colors, add branded call-to-action frames, test scannability, and download vector SVG/PNG files directly — or order them precision-crafted on our physical NFC acrylic standees.
          </p>
        </div>

        {/* Live Interactive Studio */}
        <ToolsHubStudio />

        {/* Dedicated Specialized Tools Section Header */}
        <div className="space-y-3 text-center sm:text-left pt-6 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Deep Dedicated Generators</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F0728] tracking-tight">
                Explore Dedicated QR Utilities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Need advanced multi-field contact forms, dedicated UPI merchant transaction testing, or custom WiFi encryption parameters? Use our specialized generators below.
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tool.iconColor} transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Pair with: <span className="font-semibold text-slate-600">{tool.matchingHardware}</span>
                  </span>

                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white font-bold text-xs transition shadow-xs group-hover:bg-violet-600 group-hover:text-white"
                  >
                    <span>Open Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="space-y-2.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-black mx-auto sm:mx-0 border border-violet-100">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#0F0728]">High-Resolution Vector Export</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export in crisp 1200x1200px PNG or infinitely scalable vector SVG suitable for large flex banners, vinyl prints, and professional signage.
            </p>
          </div>

          <div className="space-y-2.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black mx-auto sm:mx-0 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#0F0728]">Permanent & Zero Expiration</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our standard QR codes never expire and have zero monthly scan quotas or recurring subscriptions. Print with complete peace of mind.
            </p>
          </div>

          <div className="space-y-2.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black mx-auto sm:mx-0 border border-amber-100">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#0F0728]">1-Click Physical Hardware Printing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ready to upgrade beyond paper? Send your generated QR and business details directly to our shatterproof acrylic standees and metal NFC cards.
            </p>
          </div>
        </div>

        {/* Hardware Upgrade CTA Banner */}
        <div className="bg-gradient-to-br from-[#0F0728] via-purple-950 to-violet-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-violet-800/40">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider border border-violet-500/30">
              Physical Products
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bring Your QR Code into the Real World
            </h3>
            <p className="text-xs sm:text-sm text-violet-200 leading-relaxed">
              Paper printouts fade, get crumpled, and get grease stains. Protect your brand with shatterproof 4mm acrylic standees, countertop UPI displays, and luxury matte black NFC cards.
            </p>
          </div>

          <Link
            href="/products"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#0F0728] font-black text-xs transition flex items-center gap-2 shadow-xl active:scale-95 shrink-0"
          >
            <span>Explore Physical Hardware</span>
            <ArrowRight className="w-4 h-4 text-violet-600" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
