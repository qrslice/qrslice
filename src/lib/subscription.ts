// Copyright (c) 2026 QRslice. All rights reserved.
// Owner subscription plans, 3-month trial lifecycle, and access gating.

export const TRIAL_DURATION_DAYS = 90; // 3-month Pro trial attached to card purchases

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free Tier",
    pricePaise: 0,
    interval: "forever",
    description: "Hosted view-only digital menu for 1 card.",
    hasInbox: false,
  },
  PRO_MONTHLY: {
    id: "pro_monthly",
    name: "Pro Monthly",
    pricePaise: 29900, // ₹299/month
    interval: "month",
    description: "Unlimited cards, private feedback inbox, instant low-rating alerts, and digital menu.",
    hasInbox: true,
  },
  PRO_ANNUAL: {
    id: "pro_annual",
    name: "Pro Annual",
    pricePaise: 299900, // ₹2,999/year (Save ~₹589)
    interval: "year",
    description: "Everything in Pro with annual savings and priority support.",
    hasInbox: true,
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionStatus = "trialing" | "active" | "expired";

/**
 * Calculates trial end timestamp given a start date (90 days).
 */
export function calculateTrialEnd(startDate: Date = new Date()): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + TRIAL_DURATION_DAYS);
  return end;
}

/**
 * Returns integer days remaining in trial. Returns 0 if expired or not in trial.
 */
export function getTrialDaysRemaining(trialEndsAt: string | null | undefined, now: Date = new Date()): number {
  if (!trialEndsAt) {
    return 0;
  }
  const endMs = new Date(trialEndsAt).getTime();
  const nowMs = now.getTime();
  if (isNaN(endMs) || endMs <= nowMs) {
    return 0;
  }
  return Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates tenant subscription status.
 */
export function getSubscriptionStatus(
  tenant: {
    plan?: string | null;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
  } | null,
  now: Date = new Date(),
): SubscriptionStatus {
  if (!tenant) {
    return "expired";
  }

  // 1. Paid active subscription check
  if (tenant.plan === "active") {
    if (!tenant.subscription_ends_at) {
      return "active";
    }
    const subEnd = new Date(tenant.subscription_ends_at).getTime();
    if (!isNaN(subEnd) && subEnd > now.getTime()) {
      return "active";
    }
  }

  // 2. Trial check
  if (tenant.trial_ends_at) {
    const trialEnd = new Date(tenant.trial_ends_at).getTime();
    if (!isNaN(trialEnd) && trialEnd > now.getTime()) {
      return "trialing";
    }
  }

  return "expired";
}

/**
 * Determines whether the owner has access to the feedback inbox.
 * Pro trial and active paid subscribers have access.
 * Expired trials fall back to Free Tier (menu only, inbox locked).
 */
export function canAccessFeedbackInbox(status: SubscriptionStatus): boolean {
  return status === "trialing" || status === "active";
}

export const GRACE_PERIOD_DAYS = 3;

export interface TenantEntitlements {
  status: SubscriptionStatus | "overdue";
  inGracePeriod: boolean;
  canAccessInbox: boolean;
  canAccessCustomRouting: boolean;
  canAccessSmartShowcase: boolean;
  canExportAnalytics: boolean;
  maxCardsAllowed: number;
}

/**
 * Server-authoritative entitlement evaluation.
 * Enforces Pro features for active subscribers and trial users,
 * supports a 3-day grace period on overdue subscriptions,
 * and restricts expired tenants to Free Tier limits (1 card, view-only menu, no inbox).
 */
export function evaluateTenantEntitlements(
  tenant: {
    plan?: string | null;
    tier?: string | null;
    billing_status?: string | null;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
  } | null,
  now: Date = new Date(),
): TenantEntitlements {
  if (!tenant) {
    return {
      status: "expired",
      inGracePeriod: false,
      canAccessInbox: false,
      canAccessCustomRouting: false,
      canAccessSmartShowcase: false,
      canExportAnalytics: false,
      maxCardsAllowed: 1,
    };
  }

  const nowMs = now.getTime();

  // 1. Paid Active Check
  if (tenant.plan === "active" || tenant.billing_status === "paid") {
    if (!tenant.subscription_ends_at) {
      return {
        status: "active",
        inGracePeriod: false,
        canAccessInbox: true,
        canAccessCustomRouting: true,
        canAccessSmartShowcase: true,
        canExportAnalytics: true,
        maxCardsAllowed: Infinity,
      };
    }

    const subEndMs = new Date(tenant.subscription_ends_at).getTime();
    if (!isNaN(subEndMs) && subEndMs > nowMs) {
      return {
        status: "active",
        inGracePeriod: false,
        canAccessInbox: true,
        canAccessCustomRouting: true,
        canAccessSmartShowcase: true,
        canExportAnalytics: true,
        maxCardsAllowed: Infinity,
      };
    }

    // Grace Period Check (3 days after subscription_ends_at)
    const graceEndMs = subEndMs + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    if (nowMs <= graceEndMs) {
      return {
        status: "overdue",
        inGracePeriod: true,
        canAccessInbox: true,
        canAccessCustomRouting: true,
        canAccessSmartShowcase: true,
        canExportAnalytics: false,
        maxCardsAllowed: Infinity,
      };
    }
  }

  // 2. Trial Check (90-day card hardware trial)
  if (tenant.trial_ends_at) {
    const trialEndMs = new Date(tenant.trial_ends_at).getTime();
    if (!isNaN(trialEndMs) && trialEndMs > nowMs) {
      return {
        status: "trialing",
        inGracePeriod: false,
        canAccessInbox: true,
        canAccessCustomRouting: true,
        canAccessSmartShowcase: true,
        canExportAnalytics: true,
        maxCardsAllowed: Infinity,
      };
    }
  }

  // 3. Expired / Free Tier
  return {
    status: "expired",
    inGracePeriod: false,
    canAccessInbox: false,
    canAccessCustomRouting: false,
    canAccessSmartShowcase: false,
    canExportAnalytics: false,
    maxCardsAllowed: 1,
  };
}
