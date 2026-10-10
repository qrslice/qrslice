'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  ShoppingBag,
  ArrowRight,
  FileText,
  AlertTriangle,
  Package,
  Users,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { DashboardMetricsResult } from '@/lib/admin-stats-service';
import { downloadGSTInvoice } from '@/lib/invoice-generator';

const PERIOD_LABELS: Record<string, string> = {
  today: 'Today',
  '7d': '7D',
  '30d': '30D',
  this_month: 'Month',
  all: 'All',
};

const FULFILMENT_STAGES = [
  { key: 'order_received', label: 'Received' },
  { key: 'design_pending', label: 'Design' },
  { key: 'design_approved', label: 'Approved' },
  { key: 'ready_to_print', label: 'Print' },
  { key: 'production', label: 'Production' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export function SuperOverviewClient() {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'this_month' | 'all'>('30d');
  const [data, setData] = useState<DashboardMetricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/super/stats?period=${period}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  // GSAP Smooth Executive Orchestration
  useEffect(() => {
    if (!data || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. KPI cards entrance
      gsap.fromTo(
        '.kpi-card',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out' }
      );

      // 2. Fulfilment cells entrance
      gsap.fromTo(
        '.stage-cell',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', delay: 0.1 }
      );

      // 3. Order rows entrance
      gsap.fromTo(
        '.order-row',
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, stagger: 0.04, duration: 0.25, ease: 'power2.out', delay: 0.15 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [data]);

  const lowStockCount = data?.inventory?.lowStockCount || 0;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 1. Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview / Business operations
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 shadow-2xs self-start sm:self-auto">
          {(['today', '7d', '30d', 'this_month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                period === p
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Actionable Inventory Alert (Rendered ONLY when stock thresholds are breached) */}
      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-900">Inventory needs attention: </span>
              <span className="text-amber-800">
                {lowStockCount} {lowStockCount === 1 ? 'product' : 'products'} below stock threshold
              </span>
            </div>
          </div>
          <Link
            href="/super/products?status=low_stock"
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shrink-0 shadow-2xs"
          >
            Review
          </Link>
        </div>
      )}

      {/* 3. 4 Clean Business KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Net Revenue */}
        <div className="kpi-card p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500">Net revenue</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ₹{((data?.financials?.netRevenuePaise || 0) / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Verified captured payments
          </div>
        </div>

        {/* Orders */}
        <div className="kpi-card p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500">Orders</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {data?.orders?.total || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Total for {PERIOD_LABELS[period]}
          </div>
        </div>

        {/* Customers */}
        <div className="kpi-card p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500">Customers</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {data?.customers?.totalCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {data?.customers?.activeSubscribers || 0} active subscribers
          </div>
        </div>

        {/* Low-stock SKUs */}
        <div className="kpi-card p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500">Low-stock SKUs</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {lowStockCount === 0 ? 'All levels normal' : 'Requires replenishment'}
          </div>
        </div>
      </div>

      {/* 4. Fulfilment Overview (Compact, Clickable Stage Summary) */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Fulfilment overview
          </h2>
          <Link
            href="/super/orders"
            className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 transition"
          >
            <span>View orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {FULFILMENT_STAGES.map((st) => {
            const count = data?.orders?.byStage?.[st.key as keyof typeof data.orders.byStage] || 0;
            return (
              <Link
                key={st.key}
                href={`/super/orders?stage=${st.key}`}
                className="stage-cell p-2.5 rounded-lg bg-slate-50 hover:bg-purple-50/60 border border-slate-200/70 hover:border-purple-200 transition text-center space-y-0.5 group"
              >
                <div className="text-[11px] font-medium text-slate-500 group-hover:text-purple-700 truncate">
                  {st.label}
                </div>
                <div className="text-base font-bold text-slate-900 group-hover:text-purple-700">
                  {count}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Orders Table (Elevated hierarchy) */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent orders
            </h2>
            <span className="text-[11px] text-slate-400">
              ({data?.recentOrders?.length || 0})
            </span>
          </div>
          <Link
            href="/super/orders"
            className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading order queue...</div>
        ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No orders recorded for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2 px-2.5 font-semibold">Order</th>
                  <th className="py-2 px-2.5 font-semibold">Customer</th>
                  <th className="py-2 px-2.5 font-semibold">Item</th>
                  <th className="py-2 px-2.5 font-semibold text-right">Total</th>
                  <th className="py-2 px-2.5 font-semibold">Stage</th>
                  <th className="py-2 px-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const stageName = order.orderStage?.replace('_', ' ') || 'received';
                  return (
                    <tr key={order.id} className="order-row hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">
                        <Link href={`/super/orders?search=${order.orderNumber}`} className="hover:text-purple-600">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="font-semibold text-slate-800 truncate max-w-[140px]">
                          {order.businessLegalName || order.customerName}
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-600 truncate max-w-[180px]">
                        {firstItem?.productTitle || 'Hardware item'}
                      </td>
                      <td className="py-2.5 px-2.5 font-semibold text-slate-900 text-right tabular-nums">
                        ₹{((order.totalPaise || 0) / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/70">
                          {stageName}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        <button
                          onClick={() =>
                            downloadGSTInvoice({
                              orderNumber: order.orderNumber,
                              createdAt: order.createdAt,
                              customerName: order.customerName,
                              customerEmail: order.customerEmail,
                              customerPhone: order.customerPhone,
                              shippingAddress: order.shippingAddress,
                              gstin: order.gstin,
                              businessLegalName: order.businessLegalName,
                              items: order.items.map((it) => ({
                                title: it.productTitle,
                                quantity: it.quantity,
                                unitPricePaise: it.unitPricePaise,
                                finish: it.finish,
                                customBusinessName: it.customBusinessName,
                              })),
                              subtotalPaise: order.subtotalPaise || order.totalPaise,
                              shippingPaise: order.shippingPaise || 0,
                              totalPaise: order.totalPaise,
                            })
                          }
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Download Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
