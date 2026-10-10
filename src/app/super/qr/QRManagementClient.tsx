'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { AdminQRCodeAsset } from '@/lib/admin-qr-store';

function isValidUpiId(upi: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi.trim());
}
import {
  QrCode,
  Search,
  Filter,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Edit2,
  Smartphone,
} from 'lucide-react';

export function QRManagementClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<AdminQRCodeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Destination Edit Modal
  const [editModalAsset, setEditModalAsset] = useState<AdminQRCodeAsset | null>(null);
  const [newDestination, setNewDestination] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [isSavingDest, setIsSavingDest] = useState(false);

  // Status toggle state
  const [isTogglingStatus, setIsTogglingStatus] = useState<Record<string, boolean>>({});

  const loadAssets = async () => {
    try {
      const res = await fetch('/api/super/qr');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error('Failed to load QR assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // GSAP animation for KPI cards & rows
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.qr-kpi-card',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo(
          '.qr-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', delay: 0.1, clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, purposeFilter, statusFilter]);

  const handleOpenEdit = (asset: AdminQRCodeAsset) => {
    setEditModalAsset(asset);
    setNewDestination(asset.destinationUrl);
    setNewUpiId(asset.upiId || '');
  };

  const handleSaveDestination = async () => {
    if (!editModalAsset) return;

    if (!newDestination.trim()) {
      alert('Please enter a destination URL or URI.');
      return;
    }

    if (editModalAsset.purpose === 'payment') {
      const targetUpi = newUpiId.trim();
      if (!targetUpi || !isValidUpiId(targetUpi)) {
        alert('Invalid UPI VPA format! Must be formatted like merchant@bank (e.g. store@icici).');
        return;
      }
    }

    setIsSavingDest(true);
    try {
      const res = await fetch(`/api/super/qr/${editModalAsset.cardId}/destination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDestination: newDestination.trim(),
          upiId: editModalAsset.purpose === 'payment' ? newUpiId.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssets((prev) =>
          prev.map((a) => (a.cardId === editModalAsset.cardId ? (data.asset as AdminQRCodeAsset) : a))
        );
        setEditModalAsset(null);
        alert(`Successfully updated destination for ${editModalAsset.cardId}. Audit log entry recorded.`);
      } else {
        alert(data.error || 'Failed to update destination');
      }
    } catch {
      alert('Network error while updating destination.');
    } finally {
      setIsSavingDest(false);
    }
  };

  const handleToggleStatus = async (cardId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    setIsTogglingStatus((prev) => ({ ...prev, [cardId]: true }));
    try {
      const res = await fetch(`/api/super/qr/${cardId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          reason: `Superadmin manual toggle to ${nextStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssets((prev) =>
          prev.map((a) => (a.cardId === cardId ? (data.asset as AdminQRCodeAsset) : a))
        );
      }
    } catch {
      alert('Error updating status');
    } finally {
      setIsTogglingStatus((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  // Metrics
  const totalTaps = assets.reduce((sum, a) => sum + (a.scanCount || 0), 0);
  const reviewCount = assets.filter((a) => a.purpose === 'reputation').length;
  const paymentCount = assets.filter((a) => a.purpose === 'payment').length;

  const filtered = assets.filter((a) => {
    const matchesPurpose = purposeFilter === 'all' || a.purpose === purposeFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.cardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPurpose && matchesStatus && matchesSearch;
  });

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">QR Code & Digital Fleet Operations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fleet Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active QR & NFC devices deployed at merchant counters. Audit routing destinations, UPI VPAs, and download print-ready SVGs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAssets}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sync Fleet</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="qr-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Provisioned Nodes</span>
            <QrCode className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{assets.length}</div>
          <p className="text-[11px] text-slate-400">Crockford base32 card IDs</p>
        </div>

        <div className="qr-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cumulative Scans & Taps</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{totalTaps}</div>
          <p className="text-[11px] text-slate-400">Merchant counter engagement</p>
        </div>

        <div className="qr-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Google Review Nodes</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">{reviewCount}</div>
          <p className="text-[11px] text-slate-400">Feedback-first reputation routers</p>
        </div>

        <div className="qr-kpi-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>UPI Payment Nodes</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{paymentCount}</div>
          <p className="text-[11px] text-slate-400">Verified zero-chargeback routes</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Card ID (QS-...), café, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span className="text-xs text-slate-500 font-medium mr-1">Purpose:</span>
          {['all', 'reputation', 'payment', 'social', 'menu', 'custom_url'].map((p) => (
            <button
              key={p}
              onClick={() => setPurposeFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                purposeFilter === p
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* QR Assets Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-mono">Loading QR asset directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">No QR assets found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Card ID & Hardware SKU</th>
                  <th className="py-3 px-4">Merchant & Business</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Live Destination Route</th>
                  <th className="py-3 px-4 text-center">Taps</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((asset) => (
                  <tr key={asset.id} className="qr-row hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {asset.cardId}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px] truncate max-w-xs">{asset.linkedProductTitle}</div>
                      <div className="text-slate-400 text-[10px] font-mono">SKU: {asset.linkedSku}</div>
                    </td>

                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-bold text-slate-900 text-sm">{asset.businessName}</div>
                      <div className="text-slate-500 text-[11px]">{asset.merchantName}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          asset.purpose === 'reputation'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : asset.purpose === 'payment'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : asset.purpose === 'social'
                            ? 'bg-pink-50 text-pink-700 border-pink-200'
                            : asset.purpose === 'menu'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {asset.purpose.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-slate-700 font-mono text-[11px] truncate" title={asset.destinationUrl}>
                        {asset.destinationUrl}
                      </div>
                      {asset.upiId && (
                        <div className="text-amber-700 text-[10px] font-mono font-bold mt-0.5">
                          UPI VPA: {asset.upiId}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-black text-slate-900 text-sm">{asset.scanCount}</span>
                      {asset.lastScannedAt && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(asset.lastScannedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          asset.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : asset.status === 'pending_setup'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download SVG */}
                        <a
                          href={`/api/super/qr/${asset.cardId}/svg`}
                          download={`qrslice-${asset.cardId}.svg`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Download Vector SVG Artwork"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit Destination */}
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Edit QR Destination URL / UPI VPA"
                        >
                          <Edit2 className="w-3 h-3 text-indigo-600" />
                          <span>Route</span>
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(asset.cardId, asset.status)}
                          disabled={isTogglingStatus[asset.cardId]}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            asset.status === 'active'
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-transparent hover:border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title="Enable / Disable QR"
                        >
                          {asset.status === 'active' ? 'Disable' : 'Enable'}
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

      {/* Destination Edit Modal (with Security Guardrails) */}
      {editModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                Update Destination for {editModalAsset.cardId}
              </h3>
              <button
                onClick={() => setEditModalAsset(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong className="block text-slate-900">Security Requirement (Audit Guardrail):</strong>
                  Admin modifications to live hardware routes are cryptographically recorded in the system audit trail. If updating payment destinations, the merchant UPI VPA is verified before activation.
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Destination URL / URI *
                </label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="https://g.page/r/... or upi://pay?pa=..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {editModalAsset.purpose === 'payment' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Merchant UPI Virtual Payment Address (VPA) *
                  </label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="e.g. merchant@icici or café@okaxis"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format checked against bank routing handles.
                  </p>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-500">
                Merchant Owner: <strong className="text-slate-900">{editModalAsset.merchantName}</strong> ({editModalAsset.businessName})
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setEditModalAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDestination}
                disabled={isSavingDest}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSavingDest ? 'Saving & Auditing...' : 'Authorize Route Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
