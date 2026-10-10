// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  calculateTrialEnd,
  getTrialDaysRemaining,
  getSubscriptionStatus,
  canAccessFeedbackInbox,
  evaluateTenantEntitlements,
  SUBSCRIPTION_PLANS,
  TRIAL_DURATION_DAYS,
} from "./subscription";

describe("subscription", () => {
  it("enforces fixed pricing: Pro Monthly is ₹299 and Pro Annual is ₹2,999 in paise", () => {
    expect(SUBSCRIPTION_PLANS.PRO_MONTHLY.pricePaise).toBe(29900);
    expect(SUBSCRIPTION_PLANS.PRO_ANNUAL.pricePaise).toBe(299900);
    expect(SUBSCRIPTION_PLANS.FREE.pricePaise).toBe(0);
  });

  it("calculates trial end date exactly 90 days from start", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const end = calculateTrialEnd(start);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(TRIAL_DURATION_DAYS);
  });

  it("calculates remaining trial days accurately", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    const trialEnd = new Date("2026-01-20T00:00:00Z").toISOString();
    expect(getTrialDaysRemaining(trialEnd, now)).toBe(10);

    const expiredEnd = new Date("2026-01-05T00:00:00Z").toISOString();
    expect(getTrialDaysRemaining(expiredEnd, now)).toBe(0);
  });

  it("correctly identifies trialing, active, and expired subscription states", () => {
    const now = new Date("2026-02-01T00:00:00Z");

    // Active paid tenant
    expect(
      getSubscriptionStatus(
        {
          plan: "active",
          subscription_ends_at: new Date("2026-03-01T00:00:00Z").toISOString(),
        },
        now,
      ),
    ).toBe("active");

    // Trialing tenant
    expect(
      getSubscriptionStatus(
        {
          plan: "trial",
          trial_ends_at: new Date("2026-02-15T00:00:00Z").toISOString(),
        },
        now,
      ),
    ).toBe("trialing");

    // Expired tenant
    expect(
      getSubscriptionStatus(
        {
          plan: "trial",
          trial_ends_at: new Date("2026-01-15T00:00:00Z").toISOString(),
        },
        now,
      ),
    ).toBe("expired");
  });

  it("gates feedback inbox access to trialing and active accounts only", () => {
    expect(canAccessFeedbackInbox("trialing")).toBe(true);
    expect(canAccessFeedbackInbox("active")).toBe(true);
    expect(canAccessFeedbackInbox("expired")).toBe(false);
  });

  describe("evaluateTenantEntitlements", () => {
    const baseNow = new Date("2026-06-01T12:00:00Z");

    it("grants full Pro entitlements to active paid subscribers", () => {
      const activeTenant = {
        plan: "active",
        subscription_ends_at: new Date("2026-07-01T12:00:00Z").toISOString(),
      };
      const ent = evaluateTenantEntitlements(activeTenant, baseNow);
      expect(ent.status).toBe("active");
      expect(ent.canAccessInbox).toBe(true);
      expect(ent.canExportAnalytics).toBe(true);
      expect(ent.maxCardsAllowed).toBe(Infinity);
      expect(ent.inGracePeriod).toBe(false);
    });

    it("grants full Pro entitlements to trialing tenants", () => {
      const trialTenant = {
        plan: "trial",
        trial_ends_at: new Date("2026-06-15T12:00:00Z").toISOString(),
      };
      const ent = evaluateTenantEntitlements(trialTenant, baseNow);
      expect(ent.status).toBe("trialing");
      expect(ent.canAccessInbox).toBe(true);
      expect(ent.maxCardsAllowed).toBe(Infinity);
      expect(ent.inGracePeriod).toBe(false);
    });

    it("activates 3-day grace period for recently overdue paid subscriptions", () => {
      // Expired 1 day ago (within 3-day grace period)
      const overdueTenant = {
        plan: "active",
        subscription_ends_at: new Date("2026-05-31T12:00:00Z").toISOString(),
      };
      const ent = evaluateTenantEntitlements(overdueTenant, baseNow);
      expect(ent.status).toBe("overdue");
      expect(ent.inGracePeriod).toBe(true);
      expect(ent.canAccessInbox).toBe(true); // Still allowed access during grace period
      expect(ent.canExportAnalytics).toBe(false); // Certain premium exports paused
    });

    it("downgrades to Free Tier when subscription is overdue past 3 days", () => {
      // Expired 4 days ago (outside 3-day grace period)
      const expiredTenant = {
        plan: "active",
        subscription_ends_at: new Date("2026-05-27T12:00:00Z").toISOString(),
      };
      const ent = evaluateTenantEntitlements(expiredTenant, baseNow);
      expect(ent.status).toBe("expired");
      expect(ent.inGracePeriod).toBe(false);
      expect(ent.canAccessInbox).toBe(false);
      expect(ent.maxCardsAllowed).toBe(1);
    });

    it("downgrades to Free Tier when trial has ended without active subscription", () => {
      const expiredTrialTenant = {
        plan: "trial",
        trial_ends_at: new Date("2026-05-01T12:00:00Z").toISOString(),
      };
      const ent = evaluateTenantEntitlements(expiredTrialTenant, baseNow);
      expect(ent.status).toBe("expired");
      expect(ent.inGracePeriod).toBe(false);
      expect(ent.canAccessInbox).toBe(false);
      expect(ent.maxCardsAllowed).toBe(1);
    });

    it("handles null or missing tenant gracefully as expired Free Tier", () => {
      const ent = evaluateTenantEntitlements(null, baseNow);
      expect(ent.status).toBe("expired");
      expect(ent.canAccessInbox).toBe(false);
      expect(ent.maxCardsAllowed).toBe(1);
    });
  });
});
