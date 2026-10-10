'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertCircle, RotateCcw, MessageSquare, ArrowRight } from 'lucide-react';

export default function CheckoutFailedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800">
            Payment Incomplete
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payment Was Not Completed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your card or UPI session was cancelled or could not be charged by your bank. No money has been deducted from your account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
          <Link
            href="/checkout"
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Payment</span>
          </Link>
          <Link
            href="/cart"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center"
          >
            Review Cart
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
