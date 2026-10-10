// Copyright (c) 2026 QRslice. All rights reserved.
// Admin subscription management: Plans, renewals, trial lifecycle, and audit logs.

import { recordAuditLog } from './audit-service';

export interface AdminSubscription {
  id: string;
  tenantId: string;
  businessName: string;
  ownerEmail: string;
  ownerPhone?: string;
  planId: 'free' | 'pro_monthly' | 'pro_annual';
  status: 'trialing' | 'active' | 'overdue' | 'cancelled' | 'expired' | 'suspended';
  trialEndsAt?: string;
  currentPeriodEnd: string;
  lastPaymentId?: string;
  lastPaymentAmountPaise: number;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

// In-memory persistent registry for local development and demo
const IN_MEMORY_SUBSCRIPTIONS: AdminSubscription[] = [
  {
    id: 'sub-glow-salon',
    tenantId: 'tenant-glow-01',
    businessName: 'Glow Beauty Lounge',
    ownerEmail: 'priya@glowsalon.com',
    ownerPhone: '9811223344',
    planId: 'pro_monthly',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(),
    lastPaymentId: 'pay_RPZ_GLOW_882',
    lastPaymentAmountPaise: 29900,
    cancelAtPeriodEnd: false,
    internalNotes: 'Onboarded via Acrylic Standee order. High scan volume (280+ taps/mo).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 68).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-ironclad-gym',
    tenantId: 'tenant-ironclad-02',
    businessName: 'Ironclad Athletic Club',
    ownerEmail: 'karan@ironfitness.in',
    ownerPhone: '9988776655',
    planId: 'free',
    status: 'trialing',
    trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42).toISOString(), // 3-month hardware trial
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42).toISOString(),
    lastPaymentId: 'pay_RPZ_IRON_019',
    lastPaymentAmountPaise: 0,
    cancelAtPeriodEnd: false,
    internalNotes: 'Purchased 2-in-1 standee. Card-attached 90-day Pro trial currently active.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-apex-dental',
    tenantId: 'tenant-apex-03',
    businessName: 'Apex Dental Care',
    ownerEmail: 'anita@apexcare.in',
    ownerPhone: '9876543210',
    planId: 'pro_annual',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 310).toISOString(),
    lastPaymentId: 'pay_RPZ_APEX_ANNUAL_77',
    lastPaymentAmountPaise: 299900,
    cancelAtPeriodEnd: false,
    internalNotes: 'Clinic chain owner. Signed up for Pro Annual directly after NFC test.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 55).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-blue-tokai',
    tenantId: 'tenant-tokai-04',
    businessName: 'The Roasted Bean Café',
    ownerEmail: 'contact@roastedbeancafe.com',
    ownerPhone: '9123456789',
    planId: 'pro_monthly',
    status: 'overdue',
    currentPeriodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastPaymentId: 'pay_RPZ_ROAST_FAILED_9',
    lastPaymentAmountPaise: 29900,
    cancelAtPeriodEnd: false,
    internalNotes: 'Razorpay recurring mandate failed due to bank UPI limits. Grace period active.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Retrieve all merchant subscriptions with optional filters
 */
export async function listSubscriptions(params?: {
  status?: string;
  search?: string;
}): Promise<AdminSubscription[]> {
  let list = [...IN_MEMORY_SUBSCRIPTIONS];

  if (params?.status && params.status !== 'all') {
    list = list.filter((s) => s.status === params.status);
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.businessName.toLowerCase().includes(q) ||
        s.ownerEmail.toLowerCase().includes(q) ||
        (s.ownerPhone && s.ownerPhone.includes(q))
    );
  }

  return list;
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(id: string): Promise<AdminSubscription | null> {
  return IN_MEMORY_SUBSCRIPTIONS.find((s) => s.id === id) || null;
}

/**
 * Update subscription lifecycle status with mandatory audit logging
 */
export async function updateSubscriptionStatus(
  id: string,
  newStatus: AdminSubscription['status'],
  reason?: string,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; subscription?: AdminSubscription; error?: string }> {
  const index = IN_MEMORY_SUBSCRIPTIONS.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: 'Subscription not found' };
  }

  const prev = { ...IN_MEMORY_SUBSCRIPTIONS[index] };
  const updated: AdminSubscription = {
    ...prev,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...(reason && newStatus === 'cancelled' ? { cancellationReason: reason } : {}),
  };

  IN_MEMORY_SUBSCRIPTIONS[index] = updated;

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'subscription.status_change',
    resourceType: 'system',
    resourceId: id,
    changesBefore: { status: prev.status },
    changesAfter: { status: newStatus },
    metadata: {
      businessName: updated.businessName,
      reason: reason || `Status changed from ${prev.status} to ${newStatus}`,
    },
  });

  return { success: true, subscription: updated };
}

/**
 * Extend a trial period for a café owner
 */
export async function extendSubscriptionTrial(
  id: string,
  additionalDays: number,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; subscription?: AdminSubscription; error?: string }> {
  const index = IN_MEMORY_SUBSCRIPTIONS.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: 'Subscription not found' };
  }

  const prev = { ...IN_MEMORY_SUBSCRIPTIONS[index] };
  const currentEnd = prev.trialEndsAt ? new Date(prev.trialEndsAt) : new Date();
  currentEnd.setDate(currentEnd.getDate() + additionalDays);

  const updated: AdminSubscription = {
    ...prev,
    status: 'trialing',
    trialEndsAt: currentEnd.toISOString(),
    currentPeriodEnd: currentEnd.toISOString(),
    updatedAt: new Date().toISOString(),
  };

  IN_MEMORY_SUBSCRIPTIONS[index] = updated;

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'subscription.extend_trial',
    resourceType: 'system',
    resourceId: id,
    changesBefore: { trialEndsAt: prev.trialEndsAt },
    changesAfter: { trialEndsAt: updated.trialEndsAt },
    metadata: {
      businessName: updated.businessName,
      additionalDays,
      note: `Extended trial by ${additionalDays} days.`,
    },
  });

  return { success: true, subscription: updated };
}

/**
 * Upgrade or downgrade subscription plan with audit logging
 */
export async function updateSubscriptionPlan(
  id: string,
  newPlanId: 'free' | 'pro_monthly' | 'pro_annual',
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; subscription?: AdminSubscription; error?: string }> {
  const index = IN_MEMORY_SUBSCRIPTIONS.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: 'Subscription not found' };
  }

  const prev = { ...IN_MEMORY_SUBSCRIPTIONS[index] };
  const updated: AdminSubscription = {
    ...prev,
    planId: newPlanId,
    status: newPlanId === 'free' ? 'active' : prev.status,
    updatedAt: new Date().toISOString(),
  };

  IN_MEMORY_SUBSCRIPTIONS[index] = updated;

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'subscription.plan_change',
    resourceType: 'system',
    resourceId: id,
    changesBefore: { planId: prev.planId },
    changesAfter: { planId: newPlanId },
    metadata: {
      businessName: updated.businessName,
      note: `Plan updated to ${newPlanId}`,
    },
  });

  return { success: true, subscription: updated };
}
