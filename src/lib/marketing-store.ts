// Copyright (c) 2026 QRslice. All rights reserved.
// Marketing engine: Coupons, bundle discounts, campaigns, and audit logging.

import { recordAuditLog } from './audit-service';

export interface AdminCoupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // Percentage (e.g. 10) or Paise (e.g. 50000 for ₹500)
  minOrderPaise?: number;
  maxDiscountPaise?: number;
  freeShipping?: boolean;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  description: string;
  createdAt: string;
}

export interface BundleRule {
  id: string;
  title: string;
  description: string;
  requiredProductIds: string[];
  discountPercent: number;
  isActive: boolean;
}

// In-memory persistent coupons registry syncing with live storefront checkout
const IN_MEMORY_COUPONS: Record<string, AdminCoupon> = {
  WELCOME10: {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    usedCount: 42,
    usageLimit: 500,
    isActive: true,
    description: '10% off your entire order for new café merchants',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  BULK20: {
    code: 'BULK20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderPaise: 200000, // ₹2,000
    usedCount: 18,
    usageLimit: 200,
    isActive: true,
    description: '20% off on orders above ₹2,000',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  FREESHIP: {
    code: 'FREESHIP',
    discountType: 'percentage',
    discountValue: 0,
    freeShipping: true,
    usedCount: 89,
    isActive: true,
    description: 'Free express shipping anywhere in India',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  FESTIVE500: {
    code: 'FESTIVE500',
    discountType: 'flat',
    discountValue: 50000, // ₹500
    minOrderPaise: 250000, // ₹2,500
    usedCount: 7,
    usageLimit: 100,
    isActive: true,
    description: 'Flat ₹500 off on festive counter packs above ₹2,500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
};

const IN_MEMORY_BUNDLES: BundleRule[] = [
  {
    id: 'bundle-3in1-counter',
    title: 'Triple Action Counter Bundle (Review + UPI + Instagram)',
    description: 'Automatic 15% discount when ordering any Standee + UPI Plaque together.',
    requiredProductIds: ['prod-standee-acrylic', 'prod-plaque-wall'],
    discountPercent: 15,
    isActive: true,
  },
  {
    id: 'bundle-corp-cards',
    title: 'Multi-Location Restaurant Chain Pack',
    description: 'Buy 5 or more Table Standees and receive 20% off plus free laser logo marking.',
    requiredProductIds: ['prod-standee-wood'],
    discountPercent: 20,
    isActive: true,
  },
];

/**
 * List all coupons
 */
export async function listCoupons(): Promise<AdminCoupon[]> {
  return Object.values(IN_MEMORY_COUPONS);
}

/**
 * Create or update a coupon with audit logging
 */
export async function saveCoupon(
  coupon: Omit<AdminCoupon, 'createdAt' | 'usedCount'>,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; coupon?: AdminCoupon; error?: string }> {
  const code = coupon.code.trim().toUpperCase();
  if (!code) {
    return { success: false, error: 'Coupon code cannot be empty' };
  }

  const existing = IN_MEMORY_COUPONS[code];
  const updated: AdminCoupon = {
    ...coupon,
    code,
    usedCount: existing ? existing.usedCount : 0,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };

  IN_MEMORY_COUPONS[code] = updated;

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: existing ? 'coupon.update' : 'coupon.create',
    resourceType: 'system',
    resourceId: code,
    changesBefore: existing ? { ...existing } : undefined,
    changesAfter: { ...updated },
    metadata: {
      code,
      discountType: updated.discountType,
      discountValue: updated.discountValue,
      note: existing ? `Coupon ${code} updated` : `New coupon ${code} created`,
    },
  });

  return { success: true, coupon: updated };
}

/**
 * Toggle active status of a coupon
 */
export async function toggleCouponStatus(
  code: string,
  isActive: boolean,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; coupon?: AdminCoupon; error?: string }> {
  const normalized = code.trim().toUpperCase();
  const existing = IN_MEMORY_COUPONS[normalized];
  if (!existing) {
    return { success: false, error: 'Coupon not found' };
  }

  existing.isActive = isActive;

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'coupon.toggle_status',
    resourceType: 'system',
    resourceId: normalized,
    changesBefore: { isActive: !isActive },
    changesAfter: { isActive },
    metadata: { code: normalized, note: `Coupon ${normalized} set to ${isActive ? 'active' : 'inactive'}` },
  });

  return { success: true, coupon: existing };
}

/**
 * Delete / deactivate a coupon
 */
export async function deleteCoupon(
  code: string,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; error?: string }> {
  const normalized = code.trim().toUpperCase();
  const existing = IN_MEMORY_COUPONS[normalized];
  if (!existing) {
    return { success: false, error: 'Coupon not found' };
  }

  delete IN_MEMORY_COUPONS[normalized];

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'coupon.delete',
    resourceType: 'system',
    resourceId: normalized,
    changesBefore: { ...existing },
    metadata: { code: normalized, note: `Coupon ${normalized} removed from registry` },
  });

  return { success: true };
}

/**
 * List active bundle rules
 */
export async function listBundles(): Promise<BundleRule[]> {
  return IN_MEMORY_BUNDLES;
}
