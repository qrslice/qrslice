import React from 'react';
import { Hammer, SearchCheck, Truck, CheckCircle2 } from 'lucide-react';

export function FulfillmentTimeline() {
  const steps = [
    {
      step: '01',
      icon: Hammer,
      title: 'Laser Engraving & Microchip Encoding',
      timeline: 'Within 24–48 Hours',
      description:
        'Your brand name and high-contrast QR code are laser-etched onto optical cast acrylic. The NTAG213 microchip is encoded with your dynamic URL.',
    },
    {
      step: '02',
      icon: SearchCheck,
      title: 'Dual-Field QC & Tamper-Proof Packaging',
      timeline: 'Before Dispatch',
      description:
        'Every standee and card is tapped on both iOS and Android test rigs to verify 100% contactless response. Packaged with a sealed scratch-off claim PIN.',
    },
    {
      step: '03',
      icon: Truck,
      title: 'Express Pan-India Courier Delivery',
      timeline: '2–4 Business Days',
      description:
        'Dispatched via verified courier partners with live tracking sent to your phone. Safely packed in high-density foam to arrive ready for immediate counter display.',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Fulfillment Timeline & Craftsmanship</span>
          </h3>
          <p className="text-xs text-slate-500">
            Hand-finished and assembled in India. Commercial hardware built to withstand thousands of customer interactions.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Bench Tested</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="relative p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-violet-700 flex items-center justify-center font-black text-xs shadow-2xs">
                    <Icon className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-400">
                    STEP {s.step}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-700">
                    {s.timeline}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
