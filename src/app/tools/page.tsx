import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
  CheckCircle2,
  Download,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free QR Code Generator Tools | QrSlice',
  description: 'Generate 100% free high-resolution QR codes for Google Reviews, UPI Payments, WiFi, Digital Business Cards, Websites, and Social Media. Free PNG and vector SVG export.',
};

export default function ToolsHubPage() {
  const tools = [
    {
      id: 'google-review',
      title: 'Google Review QR Generator',
      description: 'Create a direct link QR code that opens your Google Maps 5-star review box in 1 tap.',
      icon: Star,
      iconColor: 'text-amber-500 bg-amber-50',
      badge: 'Most Popular',
      badgeColor: 'bg-amber-100 text-amber-800',
      href: '/tools/google-review',
      matchingHardware: 'Acrylic Google Review Standee',
    },
    {
      id: 'upi-payment',
      title: 'UPI Payment QR Generator',
      description: 'NPCI-compliant Indian UPI QR code. Accept payments via GPay, PhonePe, Paytm, and BHIM with 0% fee.',
      icon: CreditCard,
      iconColor: 'text-emerald-500 bg-emerald-50',
      badge: 'Zero Fees',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      href: '/tools/upi-payment',
      matchingHardware: 'Dual-QR Countertop UPI Standee',
    },
    {
      id: 'wifi',
      title: 'WiFi Connect QR Generator',
      description: 'Allow guests to connect to your cafe, clinic, or hotel WiFi without typing passwords.',
      icon: Wifi,
      iconColor: 'text-blue-500 bg-blue-50',
      badge: 'Instant Connect',
      badgeColor: 'bg-blue-100 text-blue-800',
      href: '/tools/wifi',
      matchingHardware: 'Wooden Tabletop WiFi Block',
    },
    {
      id: 'vcard',
      title: 'Digital Business Card (vCard)',
      description: 'Generate a vCard 3.0 QR code that instantly saves your contact into phone address books.',
      icon: User,
      iconColor: 'text-purple-500 bg-purple-50',
      badge: 'Networking',
      badgeColor: 'bg-purple-100 text-purple-800',
      href: '/tools/vcard',
      matchingHardware: 'Matte Black Metal NFC Card',
    },
    {
      id: 'url',
      title: 'Website & Link QR Generator',
      description: 'Universal link QR code for your homepage, menu PDF, Linktree, product brochure, or store.',
      icon: Globe,
      iconColor: 'text-indigo-500 bg-indigo-50',
      badge: 'Universal',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      href: '/tools/url',
      matchingHardware: 'Acrylic QR Counter Standee',
    },
    {
      id: 'social',
      title: 'Social Media Follow QR',
      description: 'Boost store visitors into followers on Instagram, YouTube, X (Twitter), and LinkedIn.',
      icon: Share2,
      iconColor: 'text-pink-500 bg-pink-50',
      badge: 'Grow Followers',
      badgeColor: 'bg-pink-100 text-pink-800',
      href: '/tools/social',
      matchingHardware: 'Instagram Follow NFC Standee',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 text-purple-800 text-xs font-bold border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>100% Free · No Sign-Up · Permanent High-Resolution QR Codes</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Free Business QR Code Generator Tools
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Generate unlimited high-resolution QR codes for Google Reviews, UPI payments, WiFi, contact cards, and social media. Download in PNG or vector SVG, or order printed on our shatterproof acrylic standees.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tool.iconColor} transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs transition shadow-xs group-hover:bg-purple-600 group-hover:text-white"
                  >
                    <span>Create QR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black mx-auto sm:mx-0">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">High-Resolution Vector Export</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export in crisp 1200x1200px PNG or infinitely scalable vector SVG suitable for large flex banners and print shops.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Permanent & Lifetime Active</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our standard QR codes never expire and have zero monthly scan quotas. Print with total peace of mind.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black mx-auto sm:mx-0">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">1-Click Physical Hardware Printing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Love your generated QR? Turn it into a waterproof acrylic standee or laser-etched metal NFC card with 1 click.
            </p>
          </div>
        </div>

        {/* Hardware Upgrade CTA Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold uppercase tracking-wider border border-white/10">
              Physical Products
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bring Your QR Code into the Real World
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Paper stickers get peeled and damaged. Explore our shatterproof acrylic standees, UPI displays, and luxury metal NFC cards.
            </p>
          </div>

          <Link
            href="/products"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-purple-950 font-extrabold text-xs transition flex items-center gap-2 shadow-xl active:scale-95 shrink-0"
          >
            <span>Explore Physical Hardware</span>
            <ArrowRight className="w-4 h-4 text-purple-700" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
