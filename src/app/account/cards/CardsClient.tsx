'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerCardView } from '@/lib/account-service';
import {
  CreditCard,
  Zap,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Globe,
  Star,
  Smartphone,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';

export function CardsClient() {
  const [cards, setCards] = useState<CustomerCardView[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<CustomerCardView | null>(null);
  const [newPurpose, setNewPurpose] = useState<CustomerCardView['purpose']>('reputation');
  const [newDestinationUrl, setNewDestinationUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch('/api/account/cards');
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  const openEditor = (card: CustomerCardView) => {
    setEditingCard(card);
    setNewPurpose(card.purpose);
    setNewDestinationUrl(card.destinationUrl || '');
    setStatusMessage(null);
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/account/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: editingCard.cardId,
          purpose: newPurpose,
          destinationUrl: newDestinationUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || 'Failed to update device.');
        return;
      }

      setCards((prev) =>
        prev.map((c) =>
          c.cardId === editingCard.cardId
            ? { ...c, purpose: newPurpose, destinationUrl: newDestinationUrl }
            : c
        )
      );

      setStatusMessage('✓ Tap destination updated successfully! Physical taps reflect this change immediately.');
      setTimeout(() => {
        setEditingCard(null);
      }, 1500);
    } catch {
      setStatusMessage('Network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'reputation':
        return { label: 'Google Reviews', icon: '⭐', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'custom_url':
        return { label: 'Website / Store', icon: '🌐', color: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'showcase':
        return { label: 'Digital vCard / Bio', icon: '📱', color: 'text-purple-800 bg-purple-50 border-purple-200' };
      case 'menu':
        return { label: 'Menu / Catalog', icon: '📋', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      default:
        return { label: purpose, icon: '🔗', color: 'text-slate-800 bg-slate-50 border-slate-200' };
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium">Loading your smart NFC device fleet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Smart Devices & Tap Fleet</h1>
          <p className="text-xs text-slate-500 mt-1">
            Change what happens when customers tap your physical standees and cards in 1 second.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/activate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm shadow-purple-600/20 w-fit"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Activate Device</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition shadow-xs w-fit"
          >
            <span>🛍️</span> Buy More
          </Link>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No active devices claimed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you receive your physical QRslice hardware package, find your printed 6-digit claim PIN and activate your device.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/activate"
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm"
            >
              Enter Printed Claim PIN →
            </Link>
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
            >
              Order Hardware
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => {
            const dest = getPurposeLabel(card.purpose);
            return (
              <div
                key={card.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 hover:border-purple-200 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {card.cardId}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {card.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">{card.tapCount}</span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">Total Taps</span>
                    </div>
                  </div>

                  {/* Device Title */}
                  <h3 className="text-sm font-bold text-slate-900 mt-4">{card.title}</h3>

                  {/* Current Active Destination */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Tap Destination
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${dest.color}`}
                      >
                        <span>{dest.icon}</span> {dest.label}
                      </span>
                    </div>

                    {card.destinationUrl ? (
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        Target: {card.destinationUrl}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Default internal landing experience
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a
                    href={`/a/${card.cardId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 transition flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Test Tap ↗</span>
                  </a>

                  <button
                    onClick={() => openEditor(card)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Switch Destination</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Destination Switcher Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                  {editingCard.cardId}
                </span>
                <button
                  onClick={() => setEditingCard(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-2">
                Switch Destination for &quot;{editingCard.title}&quot;
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose what customer phones open when tapped against this NFC hardware.
              </p>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 block">Select Destination</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'reputation', title: '⭐ Google Reviews', desc: 'Boost 5-star ratings & feedback' },
                    { id: 'custom_url', title: '🌐 Direct Website', desc: 'Shopify, booking link, or Instagram' },
                    { id: 'showcase', title: '📱 Digital Bio / vCard', desc: '1-tap contact card & services' },
                    { id: 'menu', title: '📋 Digital Catalog', desc: 'View-only service list or menu' },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`p-3 rounded-2xl border cursor-pointer transition text-left block ${
                        newPurpose === option.id
                          ? 'bg-purple-50 border-purple-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-purple-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="destinationPurpose"
                        value={option.id}
                        checked={newPurpose === option.id}
                        onChange={() => setNewPurpose(option.id as any)}
                        className="sr-only"
                      />
                      <p className="text-xs font-bold text-slate-900">{option.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{option.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {(newPurpose === 'custom_url' || newPurpose === 'reputation') && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {newPurpose === 'reputation' ? 'Google Review Link' : 'Website / Booking URL'} *
                  </label>
                  <input
                    type="url"
                    required
                    value={newDestinationUrl}
                    onChange={(e) => setNewDestinationUrl(e.target.value)}
                    placeholder={
                      newPurpose === 'reputation'
                        ? 'https://g.page/r/your-google-place-id/review'
                        : 'https://myshopify.com/collections'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400">
                    Changes take effect instantly on all physical taps. No re-programming needed.
                  </p>
                </div>
              )}

              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    statusMessage.startsWith('✓')
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
                >
                  {saving ? 'Updating Device...' : 'Save & Update Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
