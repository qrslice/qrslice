// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";
import { isValidGoogleReviewUrl } from "@/lib/feedback-service";

interface ReputationSettingsClientProps {
  restaurantId: string;
  initialGoogleReviewUrl: string;
  restaurantName: string;
}

export default function ReputationSettingsClient({
  restaurantId,
  initialGoogleReviewUrl,
  restaurantName,
}: ReputationSettingsClientProps) {
  const [url, setUrl] = useState(initialGoogleReviewUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = url.trim();

    // If non-empty, validate Google review domain format
    if (trimmed && !isValidGoogleReviewUrl(trimmed)) {
      setErrorMsg("Please enter a valid Google review link (e.g., https://g.page/... or https://maps.app.goo.gl/...)");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/restaurant/reputation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleReviewUrl: trimmed || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.message || "Failed to update review link.");
        return;
      }

      setSuccessMsg("Google review link updated successfully! It is now live on all guest cards.");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reputation & Review Settings</h1>
        <p className="text-sm text-neutral-400">
          Configure the public Google Review destination for {restaurantName}.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
          <span className="font-semibold block text-white mb-1">Google Compliance Guarantee</span>
          QRslice displays your direct Google review link to every guest who taps a card, without review gating or conditional barriers.
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Direct Google Review Link
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://g.page/r/your-restaurant/review"
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 font-mono text-xs focus:outline-none focus:border-neutral-500 transition-colors"
            />
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Find this link in your Google Business Profile manager under "Ask for reviews" or your Google Maps listing.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
