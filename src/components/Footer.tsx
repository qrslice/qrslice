'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { ShieldCheck, Truck, CreditCard, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0F0728] text-violet-200/85 pt-16 pb-12 border-t border-[#261447]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#261447]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo isDark={true} size="md" />
            <p className="text-xs text-violet-200/75 leading-relaxed max-w-sm">
              The restaurant and retail phygital QR layer. Precision laser-etched acrylic and metal NFC standees, luxury business cards, Google review collectors, and smart displays.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-white">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Pan-India Delivery (24–48h)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-Year Hardware Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Razorpay Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-violet-950/80 border border-violet-500/40 text-[10px] font-black text-violet-300 flex items-center justify-center shrink-0">₹</span>
                <span>Zero Monthly Subscriptions</span>
              </div>
            </div>
            <div className="pt-2 text-xs text-violet-200/80 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-violet-400" />
              <span>Direct support:</span>
              <a href="mailto:support@qrslice.com" className="text-white hover:text-violet-300 font-semibold underline underline-offset-2 transition-colors">
                support@qrslice.com
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white">
              Hardware Products
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=cards" className="hover:text-violet-300 transition-colors">
                  Google Review Cards
                </Link>
              </li>
              <li>
                <Link href="/products?category=business-cards" className="hover:text-violet-300 transition-colors">
                  Digital NFC Business Cards
                </Link>
              </li>
              <li>
                <Link href="/products?category=google-review" className="hover:text-violet-300 transition-colors">
                  Table & Counter Standees
                </Link>
              </li>
              <li>
                <Link href="/products?category=combos" className="hover:text-violet-300 transition-colors">
                  Multi-Action Combos
                </Link>
              </li>
              <li>
                <Link href="/products?category=upi-payments" className="hover:text-violet-300 transition-colors">
                  UPI & Payment Displays
                </Link>
              </li>
              <li>
                <Link href="/products?category=bulk-orders" className="hover:text-violet-300 transition-colors">
                  Bulk & Corporate Packs
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-violet-300 transition-colors">
                  Mounts & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Software & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white">
              Platform & Owners
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/activate"
                  className="inline-flex items-center gap-1.5 font-bold text-violet-300 hover:text-white transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>Activate Card or Standee</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/cards" className="hover:text-violet-300 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-violet-300 transition-colors">
                  Free QR Studio Tools
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-violet-300 transition-colors">
                  Track Manufacturing & Shipping
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-violet-300 transition-colors">
                  Hardware Specs & Materials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-violet-300 transition-colors">
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white">
              Customer Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shipping-policy" className="hover:text-violet-300 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-violet-300 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-violet-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-violet-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-violet-300 transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Single GST Truth */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-violet-300/60 gap-4">
          <p>© 2026 QRslice. All rights reserved.</p>
          <p className="text-[11px] text-center sm:text-right">
            Unregistered business entity (0% GST, no ITC). One-time hardware pricing with zero recurring subscriptions.
          </p>
        </div>
      </div>
    </footer>
  );
}
