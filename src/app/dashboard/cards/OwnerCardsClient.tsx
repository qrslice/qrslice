// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface OwnerCardItem {
  id: string;
  card_id: string;
  status: "manufactured" | "in_stock" | "assigned" | "claimed" | "active" | "disabled";
  purpose: "menu" | "reputation" | "profile" | "custom_url" | "showcase";
  destination_url?: string | null;
  activation_url: string;
  created_at: string;
  claimed_at: string | null;
}

interface OwnerCardsClientProps {
  initialCards: OwnerCardItem[];
  restaurantName: string;
}

export default function OwnerCardsClient({
  initialCards,
  restaurantName,
}: OwnerCardsClientProps) {
  const [cards, setCards] = useState<OwnerCardItem[]>(initialCards);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [editingUrlCardId, setEditingUrlCardId] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>("");

  const handlePurposeChange = async (cardId: string, newPurpose: "menu" | "reputation" | "custom_url" | "showcase") => {
    setUpdatingId(cardId);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/dashboard/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: newPurpose }),
      });

      if (!res.ok) {
        setStatusMsg({ text: "Failed to update destination.", error: true });
        return;
      }

      setCards((prev) =>
        prev.map((c) => (c.card_id === cardId ? { ...c, purpose: newPurpose } : c)),
      );
      
      const destinationLabels: Record<string, string> = {
        reputation: "Reviews & Feedback",
        custom_url: "Direct Website / Custom URL",
        showcase: "Smart Digital Showcase (vCard)",
        menu: "Digital Menu / Catalog",
      };
      setStatusMsg({ text: `Card ${cardId} repointed to ${destinationLabels[newPurpose]} instantly! No reprint required.` });
    } catch {
      setStatusMsg({ text: "Network error.", error: true });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveCustomUrl = async (cardId: string) => {
    if (!customUrlInput.trim()) return;
    setUpdatingId(cardId);
    try {
      const res = await fetch(`/api/dashboard/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_url: customUrlInput.trim() }),
      });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => (c.card_id === cardId ? { ...c, destination_url: customUrlInput.trim() } : c))
        );
        setEditingUrlCardId(null);
        setStatusMsg({ text: `Custom redirect URL saved for card ${cardId}!` });
      }
    } catch {
      setStatusMsg({ text: "Failed to save URL.", error: true });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDisableCard = async (cardId: string) => {
    if (!confirm(`Are you sure you want to disable ${cardId}? It will immediately stop resolving to your restaurant.`)) {
      return;
    }

    setUpdatingId(cardId);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/dashboard/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disabled" }),
      });

      if (!res.ok) {
        setStatusMsg({ text: "Failed to disable card.", error: true });
        return;
      }

      setCards((prev) =>
        prev.map((c) => (c.card_id === cardId ? { ...c, status: "disabled" } : c)),
      );
      setStatusMsg({ text: `Card ${cardId} disabled. It now shows a friendly inactive notice to anyone who taps it.` });
    } catch {
      setStatusMsg({ text: "Network error.", error: true });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Cards</h1>
          <p className="text-sm text-neutral-400">
            Manage physical NFC & QR cards deployed at {restaurantName}. Repoint destinations instantly without reprinting.
          </p>
        </div>

        <Link
          href="/activate"
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 shadow-lg shadow-white/5"
        >
          + Activate New Card
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium ${
            statusMsg.error
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <p className="text-sm font-semibold text-white">No active cards found</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You haven't claimed any physical cards yet. Use the scratch-off PIN from your card sleeve to link your first card.
          </p>
          <div className="pt-2">
            <Link
              href="/activate"
              className="px-4 py-2 rounded-xl bg-white text-neutral-950 text-xs font-semibold inline-block"
            >
              Activate Your First Card
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => {
            const isDisabled = card.status === "disabled";
            return (
              <div
                key={card.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDisabled
                    ? "bg-neutral-950/40 border-neutral-800/60 opacity-60"
                    : "bg-neutral-900 border-neutral-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-white tracking-wider">
                      {card.card_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isDisabled
                          ? "bg-neutral-800 text-neutral-500"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 font-mono">
                    <Link
                      href={`/a/${card.card_id}`}
                      target="_blank"
                      className="hover:text-white transition-colors"
                    >
                      qrslice.com/a/{card.card_id} ↗
                    </Link>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!isDisabled && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400 font-medium">Destination:</span>
                        <select
                          value={card.purpose}
                          onChange={(e) =>
                            handlePurposeChange(card.card_id, e.target.value as any)
                          }
                          disabled={updatingId === card.card_id}
                          className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                        >
                          <option value="reputation">Reviews & Feedback</option>
                          <option value="custom_url">Direct Website / Custom URL</option>
                          <option value="showcase">Smart Digital Showcase (vCard)</option>
                          <option value="menu">Digital Menu / Catalog</option>
                        </select>
                      </div>

                      {card.purpose === "custom_url" && (
                        <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                          {editingUrlCardId === card.card_id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="url"
                                value={customUrlInput}
                                onChange={(e) => setCustomUrlInput(e.target.value)}
                                placeholder="https://..."
                                className="px-2.5 py-1 bg-black border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 w-40"
                              />
                              <button
                                onClick={() => handleSaveCustomUrl(card.card_id)}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUrlCardId(null)}
                                className="px-1.5 py-1 text-neutral-400 hover:text-white text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUrlCardId(card.card_id);
                                setCustomUrlInput(card.destination_url || "");
                              }}
                              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-mono truncate max-w-[140px]"
                            >
                              {card.destination_url ? card.destination_url : "Set Redirect URL →"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!isDisabled ? (
                    <button
                      onClick={() => handleDisableCard(card.card_id)}
                      disabled={updatingId === card.card_id}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-red-500/10 hover:text-red-400 text-neutral-400 text-xs font-medium transition-colors"
                    >
                      Disable
                    </button>
                  ) : (
                    <span className="text-xs text-neutral-500 italic">Retired Card</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
