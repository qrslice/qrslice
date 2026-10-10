// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function ActivateCardForm() {
  const router = useRouter();

  const [cardId, setCardId] = useState("");
  const [claimPin, setClaimPin] = useState("");
  const [purpose, setPurpose] = useState<"reputation" | "menu">("reputation");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cardParam = params.get("card");
      if (cardParam) {
        setCardId(cardParam.toUpperCase());
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, claimPin, purpose }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Please sign in to your restaurant account first.");
          router.push(`/sign-in?returnUrl=${encodeURIComponent(`/activate?card=${cardId}`)}`);
          return;
        }
        setErrorMsg(data.message || "Failed to activate card.");
        return;
      }

      setSuccessMsg(data.message || "Card activated successfully!");
      setTimeout(() => {
        router.push("/dashboard/cards");
      }, 1500);
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <img
          src="/app-icon.png"
          alt="Qrslice"
          className="w-14 h-14 rounded-2xl shadow-xl shadow-indigo-500/25 mx-auto mb-2"
        />
        <h1 className="text-2xl font-bold text-white tracking-tight">Activate Your Card</h1>
        <p className="text-sm text-neutral-400">
          Enter the printed Card ID and scratch-off PIN from your sleeve.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">Printed Card ID</label>
          <input
            type="text"
            required
            value={cardId}
            onChange={(e) => setCardId(e.target.value.toUpperCase())}
            placeholder="QS-XXXXXXX"
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 font-mono focus:outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">Scratch-off Claim PIN</label>
          <input
            type="text"
            required
            maxLength={6}
            value={claimPin}
            onChange={(e) => setClaimPin(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit PIN"
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 font-mono tracking-widest text-center text-lg focus:outline-none focus:border-neutral-500 transition-colors"
          />
          <p className="text-[11px] text-neutral-500 text-center">
            Found beneath the silver scratch-off panel on the card sleeve.
          </p>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-medium text-neutral-300">Initial Tap Destination</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPurpose("reputation")}
              className={`p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                purpose === "reputation"
                  ? "bg-white/10 border-white text-white shadow-sm"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              <span className="block font-semibold">Reviews & Feedback</span>
              <span className="text-[10px] text-neutral-400">Google link + private comments</span>
            </button>
            <button
              type="button"
              onClick={() => setPurpose("menu")}
              className={`p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                purpose === "menu"
                  ? "bg-white/10 border-white text-white shadow-sm"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              <span className="block font-semibold">Digital Menu</span>
              <span className="text-[10px] text-neutral-400">View-only mobile menu</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !cardId || !claimPin}
          className="w-full mt-2 inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-neutral-950 font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5"
        >
          {isLoading ? "Activating Card..." : "Link Card to Restaurant"}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <ActivateCardForm />
    </main>
  );
}
