import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/auth';
import { SuperSidebar } from './SuperSidebar';
import { ExternalLink, Sparkles, Shield, Cpu, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'QRslice Superadmin | Hardware & Fleet Operations',
  description: 'Enterprise console for managing smart NFC card batches, laser engraving, order fulfillment, and tenant analytics.',
};

export default async function SuperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireSuperAdmin();
  if (!admin) {
    redirect('/sign-in?redirect_url=/super');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <SuperSidebar />

      {/* Main Content Area shifted right by sidebar width on desktop */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200/80 bg-white sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Production Node (India)</span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500 font-mono">RLS Isolated</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/super/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition"
            >
              <span>Fulfilment Queue</span>
            </Link>

            <Link
              href="/products"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-xs transition"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Children Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
