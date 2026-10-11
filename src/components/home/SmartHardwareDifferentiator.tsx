import React from 'react';
import Link from 'next/link';
import { RefreshCw, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export function SmartHardwareDifferentiator() {
  const pillars = [
    {
      icon: RefreshCw,
      title: 'Dynamic Cloud Link Management',
      description:
        'Never throw away a standee when your links change. Re-point any card between Google Reviews, Digital Menu, Instagram, or a custom URL from your dashboard in seconds with zero reprinting.',
      badge: 'Zero Reprinting',
    },
    {
      icon: MessageSquare,
      title: 'Direct Private Feedback Inbox',
      description:
        'Catch service issues before they turn into 1-star public rants. Your tap page allows guests to submit private notes directly to your owner dashboard inbox, while the public Google review link remains open to everyone.',
      badge: 'Owner Inbox Included',
    },
    {
      icon: ShieldCheck,
      title: '60-Second Scratch-Off Setup',
      description:
        'Every card ships with a unique printed Card ID and a sealed scratch-off claim PIN on the sleeve. Enter them at /activate to instantly link the hardware to your restaurant account.',
      badge: 'Tamper-Proof Pin',
    },
  ];

  return (
    <section className="rounded-3xl bg-[#0F0728] text-white border border-[#261447] p-6 sm:p-10 lg:p-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span>The QR Layer</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Smart hardware, retained by software.
        </h2>
        <p className="text-sm text-violet-200/80 leading-relaxed">
          Paper printouts and static QR codes break the moment a link changes. Every QRslice device includes our free cloud dashboard for life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="relative rounded-2xl bg-[#180C38] border border-[#2D1660] p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-900/50 border border-violet-500/30 text-violet-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-300 bg-violet-950/70 px-2.5 py-1 rounded-full border border-violet-500/30">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-violet-200/75 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#261447] text-xs text-violet-300/80">
        <span>Included at zero extra cost with every standee, card, or display plate.</span>
        <Link
          href="/activate"
          className="font-bold text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1.5"
        >
          <span>Try activating a demo card</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
