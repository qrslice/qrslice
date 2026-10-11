import React from 'react';
import Link from 'next/link';
import { ArrowRight, Boxes, CheckCircle2 } from 'lucide-react';

export function BulkBand() {
  return (
    <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-violet-800 text-xs font-semibold uppercase tracking-wider">
            <Boxes className="w-3.5 h-3.5 text-violet-600" />
            <span>Multi-Location & Enterprise</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Equip 10 to 500+ tables across multiple locations.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Need restaurant starter kits, custom-branded business card bundles for your corporate team, or multi-outlet review displays? Save up to 25% with volume packs and get dedicated production coordination.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Volume discounts above 10 units</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Uniform laser-etched brand identity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Single dashboard fleet control</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/bulk-orders"
            className="px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md shadow-violet-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Explore bulk kits</span>
            <ArrowRight className="w-4 h-4 text-violet-200" />
          </Link>
          <Link
            href="/contact?topic=bulk"
            className="px-5 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm text-center border border-slate-200 transition-all active:scale-[0.98]"
          >
            Request custom quote
          </Link>
        </div>
      </div>
    </section>
  );
}
