'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRStudio } from '@/components/tools/QRStudio';
import { formatUpiUri } from '@/lib/qr-generator';
import { ChevronRight, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';

export default function UpiPaymentQRPage() {
  const [vpa, setVpa] = useState('merchant@okhdfcbank');
  const [merchantName, setMerchantName] = useState('Fresh Brew Cafe');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Payment to Fresh Brew Cafe');

  const finalPayload = formatUpiUri({
    vpa,
    name: merchantName,
    amount: amount || undefined,
    note: note || undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-purple-600 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/tools" className="hover:text-purple-600 transition">
            Free QR Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">UPI Payment QR Generator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Hero Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="font-mono text-sm">₹</span>
            <span>NPCI Standard · Works with GPay, PhonePe, Paytm, BHIM, Cred</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free UPI Payment QR Code Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Create an Indian NPCI compliant static or dynamic UPI payment QR code with zero transaction charges. Compatible with all Indian banking and UPI apps.
          </p>
        </div>

        {/* QR Studio */}
        <QRStudio
          initialPayload={finalPayload}
          defaultFrameText="SCAN & PAY WITH ANY UPI APP"
          businessName={merchantName}
          suggestedProductSlug="dual-qr-upi-payment-display"
          suggestedProductTitle="Dual-QR Countertop UPI Payment Display"
          suggestedProductPricePaise={59900}
          suggestedProductImage="/products/dual-upi-standee.png"
        >
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">1. Enter Payment Details</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                UPI ID / VPA (Virtual Payment Address) *
              </label>
              <input
                type="text"
                required
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                placeholder="e.g. 9876543210@paytm or business@okhdfcbank"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-slate-500">
                You can find your UPI ID inside Google Pay, PhonePe, Paytm, or your bank app profile.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Merchant / Business Name *
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Fresh Brew Cafe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Fixed Amount (₹, Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Leave empty for customer input"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Transaction Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Bill Payment"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                100% Direct Bank Transfer. Payments go straight into your linked bank account with <strong>0% transaction fee</strong>.
              </span>
            </div>
          </div>
        </QRStudio>
      </main>

      <Footer />
    </div>
  );
}
