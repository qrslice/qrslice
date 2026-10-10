'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { AdminSubscription } from '@/lib/admin-subscription-store';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';

export function SubscriptionsClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Trial Extension Modal
  const [extendModalSub, setExtendModalSub] = useState<AdminSubscription | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [isExtending, setIsExtending] = useState(false);

  // Status Change Modal
  const [statusModalSub, setStatusModalSub] = useState<AdminSubscription | null>(null);
  const [targetStatus, setTargetStatus] = useState<AdminSubscription['status']>('active');
  const [statusReason, setStatusReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadSubscriptions = async () => {
    try {
      const res = await fetch('/api/super/subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  // GSAP animation for KPI cards & rows
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.sub-kpi-card',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo(
          '.sub-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', delay: 0.1, clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, statusFilter]);

  const handleExtendTrial = async () => {
    if (!extendModalSub) return;
    setIsExtending(true);
    try {
      const res = await fetch(`/api/super/subscriptions/${extendModalSub.id}/extend-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalDays: extendDays }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === extendModalSub.id ? (data.subscription as AdminSubscription) : s))
        );
        setExtendModalSub(null);
        alert(`Successfully extended trial for ${extendModalSub.businessName} by ${extendDays} days.`);
      } else {
        alert(data.error || 'Failed to extend trial');
      }
    } catch {
      alert('Network error while extending trial.');
    } finally {
      setIsExtending(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModalSub) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/super/subscriptions/${statusModalSub.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, reason: statusReason }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === statusModalSub.id ? (data.subscription as AdminSubscription) : s))
        );
        setStatusModalSub(null);
        setStatusReason('');
        alert(`Status updated to ${targetStatus} for ${statusModalSub.businessName}.`);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch {
      alert('Network error while updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // KPI Calculations
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const trialingCount = subscriptions.filter((s) => s.status === 'trialing').length;
  const overdueCount = subscriptions.filter((s) => s.status === 'overdue' || s.status === 'suspended').length;
  const mrrPaise = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => {
      if (s.planId === 'pro_annual') return acc + Math.round(299900 / 12);
      if (s.planId === 'pro_monthly') return acc + 29900;
      return acc;
    }, 0);

  const filtered = subscriptions.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.ownerPhone && s.ownerPhone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Subscription & Tenant Gating</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              SaaS Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Owner subscriptions (₹299/mo, ₹2,999/yr, 3-Month hardware trial). Manage grace periods, trial extensions, and access suspension.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSubscriptions}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sub-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Estimated MRR</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            ₹{(mrrPaise / 100).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Recognized recurring run-rate</p>
        </div>

        <div className="sub-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Paid Merchants</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{activeCount}</div>
          <p className="text-[11px] text-slate-400">Pro Monthly & Pro Annual</p>
        </div>

        <div className="sub-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Card-Attached Trials</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{trialingCount}</div>
          <p className="text-[11px] text-slate-400">90-day hardware Pro trials</p>
        </div>

        <div className="sub-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Failed / Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">{overdueCount}</div>
          <p className="text-[11px] text-slate-400">Razorpay mandate failures</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search café, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>
          {['all', 'active', 'trialing', 'overdue', 'suspended', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-mono">Loading subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">No merchant subscriptions matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Merchant & Business</th>
                  <th className="py-3 px-4">Software Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Period / Trial End</th>
                  <th className="py-3 px-4">Last Payment Ref</th>
                  <th className="py-3 px-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((sub) => {
                  const daysLeft = Math.ceil(
                    (new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={sub.id} className="sub-row hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm">{sub.businessName}</div>
                        <div className="text-slate-500 text-[11px]">{sub.ownerEmail}</div>
                        {sub.ownerPhone && (
                          <div className="text-slate-400 text-[10px] font-mono">+91 {sub.ownerPhone}</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            sub.planId === 'pro_annual'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : sub.planId === 'pro_monthly'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sub.planId === 'pro_annual'
                            ? 'Pro Annual (₹2,999/yr)'
                            : sub.planId === 'pro_monthly'
                            ? 'Pro Monthly (₹299/mo)'
                            : 'Free Standee Tier'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            sub.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : sub.status === 'trialing'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : sub.status === 'overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-slate-900 font-mono text-[11px]">
                          {new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            daysLeft < 0
                              ? 'text-rose-700'
                              : daysLeft <= 7
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {sub.lastPaymentId ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] text-slate-800 block">{sub.lastPaymentId}</span>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              ₹{(sub.lastPaymentAmountPaise / 100).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Hardware trial grant</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setExtendModalSub(sub);
                              setExtendDays(30);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition cursor-pointer"
                            title="Extend merchant trial period"
                          >
                            +Extend Trial
                          </button>
                          <button
                            onClick={() => {
                              setStatusModalSub(sub);
                              setTargetStatus(sub.status === 'suspended' ? 'active' : 'suspended');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              sub.status === 'suspended'
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                            title="Suspend or restore tenant access"
                          >
                            {sub.status === 'suspended' ? 'Restore' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extend Trial Modal */}
      {extendModalSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Extend Trial for {extendModalSub.businessName}
              </h3>
              <button
                onClick={() => setExtendModalSub(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Grants an extension to the merchant&apos;s Pro trial period. Their QR code menus, review routing, and tap actions will remain fully active.
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Extension Duration (Days)
                </label>
                <div className="flex gap-2">
                  {[14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setExtendDays(d)}
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                        extendDays === d
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setExtendModalSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendTrial}
                disabled={isExtending}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isExtending ? 'Granting...' : `Confirm +${extendDays} Days`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Restore Status Modal */}
      {statusModalSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {targetStatus === 'suspended' ? 'Suspend Tenant Access' : 'Restore Tenant Access'}
              </h3>
              <button
                onClick={() => setStatusModalSub(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                {targetStatus === 'suspended'
                  ? `Suspending will block the merchant dashboard for "${statusModalSub.businessName}". Public QR scans will display a maintenance notice.`
                  : `Restoring will reinstate full dashboard access and activate QR dynamic destinations immediately for "${statusModalSub.businessName}".`}
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Status Change *
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Chargeback filed / Merchant requested temporary pause"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setStatusModalSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs ${
                  targetStatus === 'suspended' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isUpdatingStatus ? 'Updating...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
