'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { FinanceSummary } from '@/lib/admin-finance-store';
import {
  Filter,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';

export function FinanceClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'this_month' | 'all'>('30d');
  const [typeFilter, setTypeFilter] = useState<'all' | 'physical_order' | 'subscription_renewal' | 'refund'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/super/finance?period=${period}&type=${typeFilter}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load finance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, typeFilter]);

  // GSAP animation for KPI cards and rows
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.fin-kpi-card',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo(
          '.fin-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', delay: 0.1, clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleExportCSV = () => {
    if (!data || !data.transactions.length) {
      alert('No transactions to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Type',
      'Reference ID',
      'Razorpay Payment ID',
      'Customer',
      'Email',
      'Gross Amount (INR)',
      'Tax Rate',
      'Tax Collected (INR)',
      'Gateway Fee (INR)',
      'Net Settled (INR)',
      'Method',
      'Status',
      'Timestamp',
    ];

    const rows = data.transactions.map((tx) => [
      tx.id,
      tx.type,
      tx.referenceId,
      tx.razorpayPaymentId,
      `"${tx.customerName}"`,
      tx.customerEmail,
      (tx.grossAmountPaise / 100).toFixed(2),
      '0% (Unregistered)',
      '0.00',
      (tx.gatewayFeePaise / 100).toFixed(2),
      (tx.netSettledPaise / 100).toFixed(2),
      tx.paymentMethod,
      tx.status,
      new Date(tx.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `qrslice-finance-report-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Payments & Gateway Reconciliation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audited Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Razorpay settlement tracking. Separate physical device ecommerce from SaaS recurring revenue (QRslice is an unregistered business entity; no GST collected).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CA CSV</span>
          </button>
        </div>
      </div>

      {/* Date & Stream Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                period === item.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span className="text-xs text-slate-500 font-medium mr-1">Stream:</span>
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'physical_order', label: 'Physical Orders' },
            { id: 'subscription_renewal', label: 'SaaS Subscriptions' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                typeFilter === t.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue & Tax Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Collected */}
        <div className="fin-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Gross Sales Collected</div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{((data?.grossCollectedPaise || 0) / 100).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Total customer payments</p>
        </div>

        {/* Physical Sales */}
        <div className="fin-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Physical Hardware Sales</div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            ₹{((data?.physicalRevenuePaise || 0) / 100).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Standees, cards & plaques</p>
        </div>

        {/* SaaS Subscriptions */}
        <div className="fin-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Software SaaS Revenue</div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            ₹{((data?.subscriptionRevenuePaise || 0) / 100).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Monthly & Annual plans</p>
        </div>

        {/* Taxes (Unregistered Entity) */}
        <div className="fin-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Taxes Collected</div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            ₹0
          </div>
          <p className="text-[11px] text-slate-400">Unregistered entity under GST</p>
        </div>

        {/* Net Cash Settled */}
        <div className="fin-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Net Bank Settlement</div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            ₹{((data?.netSettledPaise || 0) / 100).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">After gateway deductions</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-mono">Reconciling transactions...</div>
        ) : !data || data.transactions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">No transactions in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Transaction & Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Stream</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                  <th className="py-3 px-4 text-right">Tax (0%)</th>
                  <th className="py-3 px-4 text-right">Net Settled</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.transactions.map((tx) => (
                  <tr key={tx.id} className="fin-row hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-mono font-bold text-slate-900 text-xs">{tx.razorpayPaymentId}</div>
                      <div className="text-slate-500 text-[10px] font-mono">Ref: {tx.referenceId}</div>
                    </td>

                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs">{tx.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{tx.customerEmail}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          tx.type === 'physical_order'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : tx.type === 'subscription_renewal'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {tx.type === 'physical_order'
                          ? 'Physical Hardware'
                          : tx.type === 'subscription_renewal'
                          ? 'SaaS Subscription'
                          : 'Refund'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono uppercase text-slate-600 text-[11px]">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(tx.grossAmountPaise / 100).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-slate-500">
                      ₹{(tx.gstPaise / 100).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{(tx.netSettledPaise / 100).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
