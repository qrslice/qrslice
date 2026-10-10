'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  CreditCard,
  Receipt,
  Users,
  QrCode,
  Store,
  Smartphone,
  Tag,
  Globe,
  ExternalLink,
  Activity,
  ClipboardList,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Command Center', href: '/super', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Orders & Fulfilment', href: '/super/orders', icon: ShoppingBag },
      { label: 'Products & Inventory', href: '/super/products', icon: Package },
      { label: 'Card Batches Studio', href: '/super/cards', icon: Layers },
    ],
  },
  {
    group: 'Business',
    items: [
      { label: 'Subscriptions', href: '/super/subscriptions', icon: CreditCard },
      { label: 'Finance & Gateway', href: '/super/finance', icon: Receipt },
      { label: 'Customer Accounts', href: '/super/customers', icon: Users },
    ],
  },
  {
    group: 'QR & Digital',
    items: [
      { label: 'QR & Digital Assets', href: '/super/qr', icon: QrCode },
      { label: 'Merchant Portal', href: '/dashboard/cards', icon: Store },
      { label: 'NFC Tap Simulator', href: '/demo/tap-simulator', icon: Smartphone },
    ],
  },
  {
    group: 'Growth',
    items: [
      { label: 'Marketing & Coupons', href: '/super/marketing', icon: Tag },
      { label: 'Website & Content', href: '/super/content', icon: Globe },
      { label: 'Public Storefront', href: '/products', icon: ExternalLink, external: true },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'System Health & Staff', href: '/super/health', icon: Activity },
      { label: 'Audit Trail & Logs', href: '/super/audit', icon: ClipboardList },
    ],
  },
];

export function SuperSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/super') {
      return pathname === '/super';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
            QS
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900">QRslice</span>
            <span className="text-[10px] text-purple-600 font-bold ml-1.5 uppercase">Superadmin</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <Link href="/super" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-purple-600 group-hover:bg-purple-700 text-white font-black flex items-center justify-center text-xs shadow-xs transition-all">
              QS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm tracking-tight">QRslice</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200/70">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Operations Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_GROUPS.map((groupSection) => (
            <div key={groupSection.group} className="space-y-0.5">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {groupSection.group}
              </div>
              {groupSection.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    target={item.external ? '_blank' : undefined}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.external && (
                      <ExternalLink className={`w-3 h-3 shrink-0 ${active ? 'text-white/80' : 'text-slate-300'}`} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Admin Identity */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-[11px] font-bold text-purple-700 shrink-0">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Suraj (Superadmin)</p>
              <p className="text-[10px] text-slate-400 truncate">Production Node · Pan-India</p>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
