import React from 'react';
import { Smartphone, Zap, RefreshCw, Cpu, Truck } from 'lucide-react';

export function HonestTrustStrip() {
  const facts = [
    {
      icon: Smartphone,
      title: 'Dual NFC + QR',
      description: 'Works on all iPhone & Android devices',
    },
    {
      icon: Zap,
      title: 'No App Required',
      description: 'Camera scan or contactless tap triggers instantly',
    },
    {
      icon: RefreshCw,
      title: 'Free Cloud Dashboard',
      description: 'Change links anytime with zero reprinting',
    },
    {
      icon: Cpu,
      title: 'NTAG213 Chips',
      description: 'Industrial-grade contactless hardware',
    },
    {
      icon: Truck,
      title: 'Free Express Shipping',
      description: 'Tracked delivery across India on orders over ₹999',
    },
  ];

  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 sm:gap-6">
        {facts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex flex-col space-y-1.5 ${
                idx === 4 ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200/80 text-violet-700 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {item.title}
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug pl-9">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
