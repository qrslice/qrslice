'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { ShieldCheck, Truck, CreditCard, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo isDark={true} size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The restaurant and retail phygital QR layer. Precision-engineered laser-etched NFC tap standees, luxury business cards, Google review collectors, and smart displays for modern businesses.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1-Year Hardware Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Razorpay Secured</span>
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white">
              Hardware Products
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=google-review" className="hover:text-purple-400 transition">
                  Google Review Standees
                </Link>
              </li>
              <li>
                <Link href="/products?category=business-cards" className="hover:text-purple-400 transition">
                  Digital NFC Business Cards
                </Link>
              </li>
              <li>
                <Link href="/products?category=social-media" className="hover:text-purple-400 transition">
                  Instagram Follow Displays
                </Link>
              </li>
              <li>
                <Link href="/products?category=upi-payments" className="hover:text-purple-400 transition">
                  Dual UPI Payment Stands
                </Link>
              </li>
              <li>
                <Link href="/products?category=menu-ordering" className="hover:text-purple-400 transition">
                  Contactless Menu Stands
                </Link>
              </li>
              <li>
                <Link href="/products?category=bulk-orders" className="hover:text-purple-400 transition">
                  Bulk Enterprise Kits
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
                <Link href="/activate" className="hover:text-purple-400 transition">
                  Device Activation
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-purple-400 transition">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/demo/tap-simulator" className="hover:text-purple-400 transition font-bold text-purple-300">
                  Virtual NFC Tap Simulator
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-purple-400 transition">
                  Materials Spec Comparison
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-purple-400 transition">
                  Track Order & Manufacturing
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="hover:text-purple-400 transition">
                  Bulk & Corporate Kits
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-purple-400 transition">
                  Free QR Studio Tools
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-purple-400 transition">
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
                <Link href="/shipping-policy" className="hover:text-purple-400 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-purple-400 transition">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-purple-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-purple-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-purple-400 transition">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 QRslice. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Designed for Indian restaurants, cafes, salons & modern retail.
          </p>
        </div>
      </div>
    </footer>
  );
}
