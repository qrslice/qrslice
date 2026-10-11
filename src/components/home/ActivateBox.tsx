'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export function ActivateBox() {
  const router = useRouter();
  const [cardId, setCardId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cardId.trim().toUpperCase();
    if (cleaned) {
      router.push(`/activate?card=${encodeURIComponent(cleaned)}`);
    } else {
      router.push('/activate');
    }
  };

  return (
    <section className="w-full rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <h2 className="text-base font-bold text-slate-900">
              Got a card or standee?
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter the printed Card ID to link your Google Review link or digital menu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-md w-full md:w-auto">
          <input
            type="text"
            value={cardId}
            onChange={(e) => setCardId(e.target.value.toUpperCase())}
            placeholder="QS-XXXXXXX"
            className="w-full sm:w-56 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 font-mono text-sm uppercase focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all"
          />
          <button
            type="submit"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 active:scale-[0.98] shadow-sm shadow-violet-500/20"
          >
            <span>Activate</span>
            <ArrowRight className="w-3.5 h-3.5 text-violet-200" />
          </button>
        </form>
      </div>
    </section>
  );
}
