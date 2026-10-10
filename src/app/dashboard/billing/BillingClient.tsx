// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";
import {
  SUBSCRIPTION_PLANS,
  getTrialDaysRemaining,
  type SubscriptionStatus,
} from "@/lib/subscription";

interface BillingClientProps {
  restaurant: {
    id: string;
    name: string;
    plan: string;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
  };
  subscriptionStatus: SubscriptionStatus;
}

export default function BillingClient({
  restaurant,
  subscriptionStatus,
}: BillingClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<"PRO_MONTHLY" | "PRO_ANNUAL">("PRO_ANNUAL");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const trialDaysLeft = getTrialDaysRemaining(restaurant.trialEndsAt);

  const handleSubscribe = async (planKey: "PRO_MONTHLY" | "PRO_ANNUAL") => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dashboard/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to initialize checkout.");
        setIsLoading(false);
        return;
      }

      // Load Razorpay SDK
      const loadScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadScript();

      if (scriptLoaded && (window as any).Razorpay && data.keyId && data.keyId !== "rzp_test_placeholder") {
        const rzp = new (window as any).Razorpay({
          key: data.keyId,
          amount: data.amountPaise,
          currency: data.currency || "INR",
          name: "QRslice Pro",
          description: `Subscription: ${data.planName}`,
          order_id: data.razorpayOrderId,
          theme: { color: "#9333ea" },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/dashboard/billing/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  planKey,
                  razorpayOrderId: response.razorpay_order_id || data.razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setMessage("🎉 Subscription successfully activated! Pro features are now unlocked.");
                setTimeout(() => window.location.reload(), 1500);
              } else {
                setMessage(verifyData.error || "Payment verification failed.");
              }
            } catch {
              setMessage("Network error verifying subscription.");
            } finally {
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            },
          },
        });
        rzp.open();
      } else {
        // Development/test mock flow
        const verifyRes = await fetch("/api/dashboard/billing/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planKey,
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: `test_sig_${data.razorpayOrderId}`,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          setMessage("🎉 Subscription successfully activated in test mode! Pro features unlocked.");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage(verifyData.error || "Subscription verification failed.");
        }
        setIsLoading(false);
      }
    } catch {
      setMessage("Failed to initialize checkout. Please contact support.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-neutral-400">
          Manage Pro plans for {restaurant.name}. Guests never pay through QRslice.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Current Status</span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {subscriptionStatus === "trialing" && "3-Month Pro Trial Active"}
                {subscriptionStatus === "active" && "Pro Subscription Active"}
                {subscriptionStatus === "expired" && "Free Tier (Menu Only)"}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  subscriptionStatus === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : subscriptionStatus === "trialing"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                }`}
              >
                {subscriptionStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {subscriptionStatus === "trialing" && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-right">
              <span className="text-2xl font-extrabold text-blue-400 font-mono block">
                {trialDaysLeft} Days
              </span>
              <span className="text-[11px] text-blue-300">remaining in Pro trial</span>
            </div>
          )}
        </div>

        {subscriptionStatus === "expired" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
            Your 3-month Pro trial has concluded. Your digital menu remains active for guests, but the private feedback inbox is locked. Subscribe to Pro to re-enable feedback and low-rating alerts.
          </div>
        )}
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
          {message}
        </div>
      )}

      {/* Plan Selector Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pro Monthly */}
          <div
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 ${
              selectedPlan === "PRO_MONTHLY"
                ? "bg-neutral-900 border-white/40 shadow-xl"
                : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Pro Monthly</h3>
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400 font-mono">
                  Monthly
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono">₹299</span>
                <span className="text-xs text-neutral-400">/ month</span>
              </div>
              <p className="text-xs text-neutral-400">
                Cancel anytime. Ideal for flexible month-to-month budgeting.
              </p>
              <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                <li className="flex items-center gap-2">✓ Unlimited physical cards & NFC taps</li>
                <li className="flex items-center gap-2">✓ Private feedback inbox & alerts</li>
                <li className="flex items-center gap-2">✓ Hosted view-only digital menu</li>
                <li className="flex items-center gap-2">✓ Policy-compliant Google review routing</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedPlan("PRO_MONTHLY");
                handleSubscribe("PRO_MONTHLY");
              }}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              Subscribe Monthly (₹299)
            </button>
          </div>

          {/* Pro Annual */}
          <div
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 relative ${
              selectedPlan === "PRO_ANNUAL"
                ? "bg-neutral-900 border-white/40 shadow-xl"
                : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Pro Annual</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Save ₹589
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono">₹2,999</span>
                <span className="text-xs text-neutral-400">/ year</span>
              </div>
              <p className="text-xs text-neutral-400">
                Best value (~₹250/mo). Get 2 months free + priority WhatsApp support.
              </p>
              <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                <li className="flex items-center gap-2">✓ Everything in Pro Monthly</li>
                <li className="flex items-center gap-2">✓ Free card replacement credits</li>
                <li className="flex items-center gap-2">✓ Priority setup assistance</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedPlan("PRO_ANNUAL");
                handleSubscribe("PRO_ANNUAL");
              }}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
            >
              Subscribe Annual (₹2,999)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
