'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { AdminCoupon, BundleRule } from '@/lib/marketing-store';
import {
  Tag,
  Plus,
  Search,
  Sparkles,
  Layers,
  Trash2,
  Truck,
} from 'lucide-react';

export function MarketingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [bundles, setBundles] = useState<BundleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Coupon Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderRupees, setMinOrderRupees] = useState('');
  const [freeShipping, setFreeShipping] = useState(false);
  const [usageLimit, setUsageLimit] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMarketingData = async () => {
    try {
      const res = await fetch('/api/super/marketing/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
      setBundles(data.bundles || []);
    } catch (err) {
      console.error('Failed to load marketing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketingData();
  }, []);

  // GSAP animation for KPI cards, coupon rows, and bundle cards
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.mkt-kpi-card',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo(
          '.coupon-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', delay: 0.1, clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleToggleStatus = async (couponCode: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/super/marketing/coupons/${couponCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.code === couponCode ? { ...c, isActive: !currentStatus } : c))
        );
      }
    } catch {
      alert('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      const res = await fetch(`/api/super/marketing/coupons/${couponCode}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      }
    } catch {
      alert('Failed to delete coupon');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Please enter a coupon code.');
      return;
    }

    const val = parseFloat(discountValue) || 0;
    const minOrderPaise = minOrderRupees ? Math.round(parseFloat(minOrderRupees) * 100) : undefined;
    const finalVal = discountType === 'flat' ? Math.round(val * 100) : val;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/super/marketing/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          discountType,
          discountValue: finalVal,
          minOrderPaise,
          freeShipping,
          usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupons((prev) => [data.coupon, ...prev]);
        setShowCreateModal(false);
        setCode('');
        setDescription('');
        setMinOrderRupees('');
        setUsageLimit('');
        alert(`Coupon ${data.coupon.code} created and live on storefront!`);
      } else {
        alert(data.error || 'Failed to create coupon');
      }
    } catch {
      alert('Network error while saving coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Marketing, Coupons & Bundles</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              Growth Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage storefront promo codes, bulk buyer discounts, free shipping promotions, and multi-product bundles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="mkt-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Storefront Coupons</span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {coupons.filter((c) => c.isActive).length}
          </div>
          <p className="text-[11px] text-slate-400">Live at storefront checkout</p>
        </div>

        <div className="mkt-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Redemptions</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
          </div>
          <p className="text-[11px] text-slate-400">Successful checkout applications</p>
        </div>

        <div className="mkt-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Automated Bundle Rules</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">{bundles.length}</div>
          <p className="text-[11px] text-slate-400">Multi-item cart discount triggers</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 transition"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-mono">Loading marketing ledger...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">No coupons found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Min Order Threshold</th>
                  <th className="py-3 px-4">Usage Limit</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCoupons.map((c) => (
                  <tr key={c.code} className="coupon-row hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 space-y-0.5">
                      <span className="font-mono font-bold text-slate-900 text-xs px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 block w-fit">
                        {c.code}
                      </span>
                      <p className="text-[11px] text-slate-500">{c.description}</p>
                    </td>

                    <td className="py-4 px-4">
                      {c.freeShipping ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                          <Truck className="w-3 h-3" /> Free Express Shipping
                        </span>
                      ) : c.discountType === 'percentage' ? (
                        <span className="text-emerald-700 font-mono font-bold text-sm">
                          {c.discountValue}% OFF
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-mono font-bold text-sm">
                          ₹{(c.discountValue / 100).toLocaleString('en-IN')} FLAT OFF
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-700">
                      {c.minOrderPaise ? `₹${(c.minOrderPaise / 100).toLocaleString('en-IN')}` : 'None (₹0)'}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-500">
                      {c.usageLimit ? `${c.usageLimit} total` : 'Unlimited'}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-900 font-bold">
                      {c.usedCount} used
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(c.code, c.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            c.isActive
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bundle Discounts Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h2 className="text-base font-bold text-slate-900">Active Product Bundle Automations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundles.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{b.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                  {b.discountPercent}% BUNDLE DISCOUNT
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{b.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                Create New Promo Code
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30, DIWALI15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 1500)"
                    value={minOrderRupees}
                    onChange={(e) => setMinOrderRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 250)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="freeShipCheck"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-0"
                />
                <label htmlFor="freeShipCheck" className="text-slate-700 cursor-pointer">
                  Grant Free Express Shipping
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Internal Description</label>
                <input
                  type="text"
                  placeholder="e.g. Special festive campaign discount for restaurants"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Creating...' : 'Launch Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
