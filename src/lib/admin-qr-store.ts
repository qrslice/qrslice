// Copyright (c) 2026 QRslice. All rights reserved.
// Digital QR Code asset registry, routing destinations, UPI validation, and cryptographic audit logs.

import { recordAuditLog } from './audit-service';
import { generateQrSvgString } from './qr-generator';

export type QRPurpose = 'reputation' | 'payment' | 'social' | 'menu' | 'custom_url' | 'wifi';

export interface AdminQRCodeAsset {
  id: string;
  cardId: string; // QS- Crockford base32 ID
  merchantId: string;
  merchantName: string;
  businessName: string;
  purpose: QRPurpose;
  destinationUrl: string;
  upiId?: string;
  linkedProductTitle: string;
  linkedSku: string;
  status: 'active' | 'disabled' | 'pending_setup';
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// In-memory active QR asset registry
const IN_MEMORY_QR_ASSETS: AdminQRCodeAsset[] = [
  {
    id: 'qr-asset-1',
    cardId: 'QS-8K2M9P4',
    merchantId: 'cust-glow-salon',
    merchantName: 'Priya Sharma',
    businessName: 'Glow Beauty Lounge',
    purpose: 'reputation',
    destinationUrl: 'https://g.page/r/example-glow-salon-reviews',
    linkedProductTitle: 'Acrylic Google Review Standee (NFC + QR)',
    linkedSku: 'QS-GOO-001',
    status: 'active',
    scanCount: 312,
    lastScannedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'qr-asset-2',
    cardId: 'QS-3F7N1X5',
    merchantId: 'cust-ironclad-gym',
    merchantName: 'Karan Mehra',
    businessName: 'Ironclad Athletic Club',
    purpose: 'payment',
    destinationUrl: 'upi://pay?pa=ironcladfitness@icici&pn=Ironclad%20Athletic%20Club&cu=INR',
    upiId: 'ironcladfitness@icici',
    linkedProductTitle: '2-in-1 Dual Standee (Review + Payment)',
    linkedSku: 'QS-GOO-002',
    status: 'active',
    scanCount: 184,
    lastScannedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'qr-asset-3',
    cardId: 'QS-7N3K8M2',
    merchantId: 'cust-apex-dental',
    merchantName: 'Dr. Anita Roy',
    businessName: 'Apex Dental Care',
    purpose: 'custom_url',
    destinationUrl: 'https://apexdentalcare.in/book-appointment',
    linkedProductTitle: 'Wall & Mirror Mount NFC Review Plate',
    linkedSku: 'QS-GOO-004',
    status: 'active',
    scanCount: 95,
    lastScannedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'qr-asset-4',
    cardId: 'QS-4X9J2L7',
    merchantId: 'cust-roasted-bean',
    merchantName: 'Kabir Varma',
    businessName: 'The Roasted Bean Café',
    purpose: 'menu',
    destinationUrl: 'https://qrslice.com/m/roasted-bean-delhi',
    linkedProductTitle: 'Wooden Google Review Standee (Premium Teak Finish)',
    linkedSku: 'QS-GOO-005',
    status: 'active',
    scanCount: 642,
    lastScannedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'qr-asset-5',
    cardId: 'QS-6W1P8Q3',
    merchantId: 'cust-urban-spices',
    merchantName: 'Vikram Joshi',
    businessName: 'Urban Spices Bistro',
    purpose: 'social',
    destinationUrl: 'https://instagram.com/urbanspicesbistro',
    linkedProductTitle: '3-in-1 Triple Counter Standee',
    linkedSku: 'QS-GOO-003',
    status: 'pending_setup',
    scanCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Validates UPI Virtual Payment Address (VPA) format.
 * Format: username@bankhandle (e.g. merchant@okaxis, store@icici)
 */
export function isValidUpiId(upi: string): boolean {
  if (!upi || typeof upi !== 'string') return false;
  const regex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return regex.test(upi.trim());
}

/**
 * List all QR assets with optional filters
 */
export async function listQRAssets(params?: {
  purpose?: string;
  status?: string;
  search?: string;
}): Promise<AdminQRCodeAsset[]> {
  let list = [...IN_MEMORY_QR_ASSETS];

  if (params?.purpose && params.purpose !== 'all') {
    list = list.filter((q) => q.purpose === params.purpose);
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((q) => q.status === params.status);
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.cardId.toLowerCase().includes(q) ||
        item.businessName.toLowerCase().includes(q) ||
        item.merchantName.toLowerCase().includes(q) ||
        item.destinationUrl.toLowerCase().includes(q) ||
        (item.upiId && item.upiId.toLowerCase().includes(q))
    );
  }

  return list;
}

/**
 * Update QR Destination with strict validation and cryptographic audit trail.
 * Security enforcement: NEVER let an admin silently modify payment routes.
 */
export async function updateQRDestination(
  cardId: string,
  newDestination: string,
  upiId?: string,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; asset?: AdminQRCodeAsset; error?: string }> {
  const index = IN_MEMORY_QR_ASSETS.findIndex((q) => q.cardId === cardId);
  if (index === -1) {
    return { success: false, error: 'QR Asset not found' };
  }

  const prev = { ...IN_MEMORY_QR_ASSETS[index] };

  // If this is a payment QR, validate UPI VPA strictly
  if (prev.purpose === 'payment') {
    const targetUpi = upiId || (newDestination.startsWith('upi://') ? new URL(newDestination).searchParams.get('pa') : null);
    if (!targetUpi || !isValidUpiId(targetUpi)) {
      return {
        success: false,
        error: 'Invalid UPI VPA format. Must be formatted like merchant@bank (e.g. store@icici)',
      };
    }
  }

  const updated: AdminQRCodeAsset = {
    ...prev,
    destinationUrl: newDestination.trim(),
    ...(upiId ? { upiId: upiId.trim() } : {}),
    updatedAt: new Date().toISOString(),
  };

  IN_MEMORY_QR_ASSETS[index] = updated;

  // Record mandatory audit trail with before/after state
  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'qr.destination_update',
    resourceType: 'system',
    resourceId: cardId,
    changesBefore: {
      destinationUrl: prev.destinationUrl,
      upiId: prev.upiId,
    },
    changesAfter: {
      destinationUrl: updated.destinationUrl,
      upiId: updated.upiId,
    },
    metadata: {
      cardId,
      businessName: updated.businessName,
      purpose: updated.purpose,
      note: `Sensitive QR destination updated for ${cardId}`,
    },
  });

  return { success: true, asset: updated };
}

/**
 * Toggle QR status (e.g. temporary disable for lost standee or fraud alert)
 */
export async function toggleQRStatus(
  cardId: string,
  newStatus: 'active' | 'disabled',
  reason?: string,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; asset?: AdminQRCodeAsset; error?: string }> {
  const index = IN_MEMORY_QR_ASSETS.findIndex((q) => q.cardId === cardId);
  if (index === -1) {
    return { success: false, error: 'QR Asset not found' };
  }

  const prev = { ...IN_MEMORY_QR_ASSETS[index] };
  const updated: AdminQRCodeAsset = {
    ...prev,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  IN_MEMORY_QR_ASSETS[index] = updated;

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'qr.status_toggle',
    resourceType: 'system',
    resourceId: cardId,
    changesBefore: { status: prev.status },
    changesAfter: { status: newStatus },
    metadata: {
      cardId,
      reason: reason || `Status set to ${newStatus}`,
    },
  });

  return { success: true, asset: updated };
}

/**
 * Generate preview vector SVG for this QR code asset
 */
export async function getQRCodeSVG(cardId: string): Promise<string> {
  const asset = IN_MEMORY_QR_ASSETS.find((q) => q.cardId === cardId);
  const target = asset?.destinationUrl || `https://qrslice.com/a/${cardId}`;
  return generateQrSvgString(target, { width: 500, margin: 2 });
}
