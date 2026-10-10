'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { BrandLogo } from '@/components/BrandLogo';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/account/orders', label: '📦 Orders & GST Invoices' },
    { href: '/account/cards', label: '💳 My Smart Devices' },
    { href: '/account/wishlist', label: '❤️ Saved Wishlist' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-100 selection:text-purple-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo href="/" size="md" />

            {/* Nav Tabs */}
            <nav className="hidden sm:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-purple-100/80 text-purple-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 transition flex items-center gap-1.5"
            >
              <span>🛍️</span> Products Catalog
            </Link>
            <UserButton />
          </div>
        </div>

        {/* Mobile Tab Row */}
        <div className="sm:hidden flex border-t border-slate-100 px-3 py-2 gap-1.5 bg-white">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition truncate ${
                  isActive
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        QRslice Customer Portal · Pan-India Hardware Dispatch & Smart Device Management
      </footer>
    </div>
  );
}
