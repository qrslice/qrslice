// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";

interface FeedbackClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    googleReviewUrl: string | null;
  };
  cardId: string;
}

export default function FeedbackClient({ tenant, cardId }: FeedbackClientProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMsg("Please select a star rating.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          cardId,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.message || "Failed to submit feedback. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6 text-center">
      {tenant.logoUrl && (
        <img
          src={tenant.logoUrl}
          alt={tenant.name}
          className="w-16 h-16 rounded-2xl mx-auto object-cover border border-neutral-700 shadow-md"
        />
      )}

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">{tenant.name}</h1>
        <p className="text-xs text-neutral-400 font-medium">How was your visit today?</p>
      </div>

      {/* Google Review Link: ALWAYS rendered and visible to every guest (compliance requirement) */}
      {tenant.googleReviewUrl && (
        <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
          <p className="text-xs text-neutral-400">Share your public review with the community:</p>
          <a
            href={tenant.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm6 8h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            Review on Google
          </a>
        </div>
      )}

      {/* Direct Feedback Form */}
      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-lg">
            ✓
          </div>
          <h2 className="text-base font-semibold text-white">Thank You!</h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Your feedback has been delivered directly to management. We appreciate your thoughts.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-left">
          <div className="space-y-2 text-center">
            <span className="text-xs text-neutral-400 font-medium block">Rate your experience:</span>
            <div className="flex justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <span className={isLit ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-neutral-700"}>
                      ★
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Direct note for management (private & optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did we do well or how could we improve?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-500 transition-colors resize-none"
            />
            <span className="text-[10px] text-neutral-600 block text-right">
              {comment.length}/500
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 text-center font-medium">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full py-3 px-4 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-white/5"
          >
            {isSubmitting ? "Sending..." : "Submit Private Feedback"}
          </button>
        </form>
      )}
    </div>
  );
}
