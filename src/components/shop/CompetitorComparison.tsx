import React from 'react';
import { Check, X, Minus } from 'lucide-react';

export function CompetitorComparison() {
  const comparisonRows = [
    {
      feature: 'Ongoing Subscription Fee',
      qrslice: '₹0 / Free for Life',
      saas: '₹499 – ₹1,999 / month',
      staticStand: '₹0 (No software)',
      highlight: true,
    },
    {
      feature: 'Cloud Re-pointing',
      qrslice: 'Instant from dashboard with zero reprinting',
      saas: 'Supported (locked behind monthly fee)',
      staticStand: 'Impossible (must reprint & discard)',
      highlight: false,
    },
    {
      feature: 'Google Review Policy',
      qrslice: '100% Compliant (Public review link always visible)',
      saas: 'Risky review-gating (risks Google suspension)',
      staticStand: 'Direct link only',
      highlight: false,
    },
    {
      feature: 'Private Feedback Inbox',
      qrslice: 'Included free (Direct to owner dashboard)',
      saas: 'Expensive add-on tier',
      staticStand: 'None (Angry guests go straight to public Google page)',
      highlight: false,
    },
    {
      feature: 'Hardware Core',
      qrslice: 'Genuine NXP NTAG213 + Cast Acrylic / Steel',
      saas: 'Generic plastic sticker tags',
      staticStand: 'Paper prints / adhesive vinyl',
      highlight: false,
    },
    {
      feature: 'Setup Experience',
      qrslice: '60-second activation with tamper-proof scratch PIN',
      saas: 'Sales demo call & recurring credit card mandate',
      staticStand: 'Manual printout alignment',
      highlight: false,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Why Business Owners Choose QRslice</span>
          </h3>
          <p className="text-xs text-slate-500">
            Hardware you own outright. Software that retains your customer relationships for life without monthly rent.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 w-fit">
          Zero Monthly Fees
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-3 font-bold text-slate-500 w-1/3">Feature</th>
              <th className="py-3 px-3 font-black text-violet-900 bg-violet-50/70 rounded-t-xl w-1/4">
                QRslice
              </th>
              <th className="py-3 px-3 font-semibold text-slate-500 w-1/4">
                Monthly SaaS Providers
              </th>
              <th className="py-3 px-3 font-semibold text-slate-500 w-1/6">
                Static Paper / Stickers
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition">
                <td className="py-3.5 px-3 font-bold text-slate-900">
                  {row.feature}
                </td>
                <td className="py-3.5 px-3 font-black text-violet-900 bg-violet-50/70">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>{row.qrslice}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{row.saas}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{row.staticStand}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
