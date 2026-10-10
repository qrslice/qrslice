// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user || !user.restaurantId) {
    redirect("/sign-in?returnUrl=/dashboard/analytics");
  }

  const supabase = createSupabaseAdmin();

  const [{ data: restaurant }, { data: feedback }, { data: cards }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name")
      .eq("id", user.restaurantId)
      .single(),
    supabase
      .from("feedback")
      .select("rating, card_id, created_at")
      .eq("tenant_id", user.restaurantId),
    supabase
      .from("cards")
      .select("card_id, purpose, status")
      .eq("tenant_id", user.restaurantId),
  ]);

  const feedbackList = feedback || [];
  const cardList = cards || [];

  const totalReviews = feedbackList.length;
  const ratingSum = feedbackList.reduce((acc, f) => acc + f.rating, 0);
  const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : "—";

  // Distribution by stars
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const cardFeedbackCount: Record<string, number> = {};

  for (const f of feedbackList) {
    distribution[f.rating] = (distribution[f.rating] || 0) + 1;
    if (f.card_id) {
      cardFeedbackCount[f.card_id] = (cardFeedbackCount[f.card_id] || 0) + 1;
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Review & Tap Insights</h1>
        <p className="text-sm text-neutral-400">
          Transparent, read-only metrics aggregated directly from guest feedback for {restaurant?.name || "your restaurant"}.
        </p>
      </div>

      {/* Core Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Average Rating</span>
          <div className="text-3xl font-extrabold text-white flex items-baseline gap-1.5 font-mono">
            {averageRating}
            <span className="text-amber-400 text-lg">★</span>
          </div>
          <p className="text-[11px] text-neutral-500">Computed strictly from real guest submissions.</p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Total Feedback</span>
          <div className="text-3xl font-extrabold text-white font-mono">{totalReviews}</div>
          <p className="text-[11px] text-neutral-500">Private notes and ratings received.</p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Active Cards</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {cardList.filter((c) => c.status === "active").length}
          </div>
          <p className="text-[11px] text-neutral-500">NFC & QR cards currently resolving.</p>
        </div>
      </div>

      {/* Star Breakdown */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-base font-semibold text-white">Rating Distribution</h2>
        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-mono text-neutral-300 font-medium flex items-center gap-1">
                  {stars} <span className="text-amber-400">★</span>
                </span>
                <div className="flex-1 h-3 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stars >= 4 ? "bg-amber-400" : stars === 3 ? "bg-amber-600" : "bg-red-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 font-mono text-neutral-400 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Breakdown */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-base font-semibold text-white">Per-Card Activity</h2>
        {cardList.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">No cards registered yet.</p>
        ) : (
          <div className="space-y-2">
            {cardList.map((c) => (
              <div
                key={c.card_id}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{c.card_id}</span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400 uppercase font-mono">
                    {c.purpose}
                  </span>
                </div>
                <div className="font-mono text-neutral-300">
                  {cardFeedbackCount[c.card_id] || 0} reviews
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
