import React from 'react';
import { ShoppingBag, Settings, Star } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: ShoppingBag,
      title: 'Order your hardware',
      description: 'Choose your standee or tap card. Enter your business name or logo during checkout for precision laser engraving.',
    },
    {
      num: '02',
      icon: Settings,
      title: 'Tap to configure',
      description: 'Receive your card in 3–5 days. Enter your scratch-off PIN at /activate to link your Google Place ID or destination in 60 seconds.',
    },
    {
      num: '03',
      icon: Star,
      title: 'Collect reviews',
      description: 'Place on your counter or table. Guests tap or scan with their phone. No app needed — your review page opens instantly.',
    },
  ];

  return (
    <section className="rounded-3xl bg-[#0F0728] text-white border border-[#261447] p-6 sm:p-10 lg:p-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span>Setup Workflow</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          It’s a card. They tap it. You get the review.
        </h2>
        <p className="text-sm text-violet-200/80 leading-relaxed">
          Three simple steps from unboxing to collecting five-star Google feedback on auto-pilot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative rounded-2xl bg-[#180C38] border border-[#2D1660] p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-violet-900/50 border border-violet-500/30 text-violet-300 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-violet-800/60 tracking-tight">
                  {step.num}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-violet-200/75 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
