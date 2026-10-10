import React, { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import { findOrderByNumber } from '@/lib/orders-store';
import { DownloadInvoiceButton } from '@/components/shop/DownloadInvoiceButton';

function OrderSuccessContent({ searchParams }: { searchParams: Promise<{ orderNumber?: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Order Confirmation...</div>}>
      <OrderSuccessView searchParams={searchParams} />
    </Suspense>
  );
}

async function OrderSuccessView({ searchParams }: { searchParams: Promise<{ orderNumber?: string }> }) {
  const params = await searchParams;
  const orderNumber = params.orderNumber || 'ORD-2026-CONFIRMED';
  const orderRecord = await findOrderByNumber(orderNumber);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Payment Verified & Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your hardware is being queued for laser engraving and precision NFC programming.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 max-w-md mx-auto flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold">Order Number:</span>
            <span className="text-sm font-black font-mono text-purple-700">{orderNumber}</span>
          </div>

          {/* Timeline Milestones */}
          <div className="pt-4 border-t border-slate-100 text-left space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Fulfillment Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700">STEP 1</span>
                <p className="font-bold text-slate-900 mt-0.5">Order Verified</p>
                <p className="text-[11px] text-emerald-600 font-medium">Completed</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">STEP 2</span>
                <p className="font-bold text-slate-900 mt-0.5">Laser Engraving</p>
                <p className="text-[11px] text-purple-600 font-medium">In Queue</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">STEP 3</span>
                <p className="font-bold text-slate-900 mt-0.5">NFC QA Check</p>
                <p className="text-[11px] text-slate-400">Next</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">STEP 4</span>
                <p className="font-bold text-slate-900 mt-0.5">Express Dispatch</p>
                <p className="text-[11px] text-slate-400">Pan-India</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {orderRecord && (
              <DownloadInvoiceButton
                order={{
                  orderNumber: orderRecord.orderNumber,
                  createdAt: orderRecord.createdAt,
                  customerName: orderRecord.customerName,
                  customerEmail: orderRecord.customerEmail,
                  customerPhone: orderRecord.customerPhone,
                  shippingAddress: orderRecord.shippingAddress,
                  gstin: orderRecord.gstin,
                  businessLegalName: orderRecord.businessLegalName,
                  items: orderRecord.items,
                  subtotalPaise: orderRecord.subtotalPaise || orderRecord.totalPaise,
                  shippingPaise: orderRecord.shippingPaise || 0,
                  totalPaise: orderRecord.totalPaise,
                }}
              />
            )}
            <Link
              href="/account/orders"
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Track in Account Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  return <OrderSuccessContent searchParams={searchParams} />;
}
