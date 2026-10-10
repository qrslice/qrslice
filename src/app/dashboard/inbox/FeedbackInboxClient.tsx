// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";
import type { FeedbackItem, FeedbackStats } from "@/lib/feedback-service";

interface FeedbackInboxClientProps {
  initialFeedback: FeedbackItem[];
  initialStats: FeedbackStats;
  tenantName: string;
}

export default function FeedbackInboxClient({
  initialFeedback,
  initialStats,
  tenantName,
}: FeedbackInboxClientProps) {
  const [items, setItems] = useState<FeedbackItem[]>(initialFeedback);
  const [stats, setStats] = useState<FeedbackStats>(initialStats);
  const [filter, setFilter] = useState<"all" | "low" | "positive" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: "new" | "reviewed" | "resolved") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "low") return item.rating <= 3 && item.status !== "resolved";
    if (filter === "positive") return item.rating >= 4;
    if (filter === "resolved") return item.status === "resolved";
    return true;
  });

  const unaddressedLowRatings = items.filter(
    (item) => item.rating <= 3 && item.status !== "resolved",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Feedback Inbox</h1>
          <p className="text-sm text-neutral-400">
            Real-time private guest feedback collected via physical cards at {tenantName}.
          </p>
        </div>
      </div>

      {/* Low-Rating Alert Banner (T3 requirement) */}
      {unaddressedLowRatings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Low-Rating Alert</h2>
              <p className="text-xs text-amber-300/90">
                {unaddressedLowRatings.length} guest{unaddressedLowRatings.length > 1 ? "s" : ""} left 3 stars or lower. Review their comments to resolve operational issues quickly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilter("low")}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-semibold hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            View Alerts
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-500 font-medium">Average Rating</span>
          <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-1">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
            <span className="text-amber-400 text-sm">★</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-500 font-medium">Total Feedback</span>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-500 font-medium">Needs Attention (≤3★)</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{unaddressedLowRatings.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-500 font-medium">New Submissions</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.newCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "all" ? "bg-white text-neutral-950 font-semibold" : "text-neutral-400 hover:text-white"
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "low" ? "bg-amber-500 text-neutral-950 font-semibold" : "text-neutral-400 hover:text-white"
          }`}
        >
          Needs Attention ({unaddressedLowRatings.length})
        </button>
        <button
          onClick={() => setFilter("positive")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "positive" ? "bg-white text-neutral-950 font-semibold" : "text-neutral-400 hover:text-white"
          }`}
        >
          Positive (4–5★)
        </button>
        <button
          onClick={() => setFilter("resolved")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "resolved" ? "bg-white text-neutral-950 font-semibold" : "text-neutral-400 hover:text-white"
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Feedback List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
          <p className="text-sm font-medium text-neutral-300">No feedback entries found</p>
          <p className="text-xs text-neutral-500">
            {filter === "all"
              ? "Feedback will appear here as guests tap physical cards in your dining area."
              : "No feedback matching the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isLow = item.rating <= 3;
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLow && item.status !== "resolved"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-neutral-900 border-neutral-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < item.rating ? "text-amber-400" : "text-neutral-700"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500 font-mono">
                        {new Date(item.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {item.card_id && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400 font-mono">
                          {item.card_id}
                        </span>
                      )}
                    </div>

                    {item.comment ? (
                      <p className="text-sm text-neutral-200 font-normal leading-relaxed pt-1">
                        {item.comment}
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 italic pt-1">No written comment provided.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== "resolved" ? (
                      <button
                        onClick={() => handleStatusChange(item.id, "resolved")}
                        disabled={updatingId === item.id}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
