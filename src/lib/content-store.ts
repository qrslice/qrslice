// Copyright (c) 2026 QRslice. All rights reserved.
// Website & Content Control: Announcement banners, SEO metadata, support contacts, and maintenance toggles.

import { recordAuditLog } from './audit-service';

export interface WebsiteContentSettings {
  announcementBar: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    badgeText?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string;
    keywords: string[];
  };
  support: {
    supportPhone: string;
    supportEmail: string;
    operationalHours: string;
    businessAddress: string;
  };
  systemNotices: {
    maintenanceMode: boolean;
    maintenanceNotice?: string;
    orderFulfillmentNotice?: string;
  };
  updatedAt: string;
  updatedBy: string;
}

// In-memory persistent site configuration
let IN_MEMORY_CONTENT_SETTINGS: WebsiteContentSettings = {
  announcementBar: {
    enabled: true,
    text: '⚡ Free Express Shipping across India on orders above ₹999. Laser marked within 24 hours.',
    linkUrl: '/products',
    badgeText: 'FESTIVE SALE',
  },
  seo: {
    metaTitle: 'QRslice | The Restaurant QR & NFC Physical Layer',
    metaDescription: 'Custom laser-engraved NFC & QR standees, plaques, and smart business cards for cafés, restaurants, salons, and local retail.',
    ogImageUrl: '/images/og-preview.png',
    keywords: ['NFC standee', 'Google review standee', 'UPI QR display', 'restaurant QR menu', 'smart NFC business card'],
  },
  support: {
    supportPhone: '+91 98110 00000',
    supportEmail: 'ops@qrslice.com',
    operationalHours: 'Mon-Sat: 10:00 AM - 7:00 PM IST',
    businessAddress: 'Sector 44, Institutional Area, Gurugram, Haryana 122003, India',
  },
  systemNotices: {
    maintenanceMode: false,
    maintenanceNotice: '',
    orderFulfillmentNotice: 'Standard laser etching & BlueDart dispatch time: 24 to 48 hours.',
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'suraj@qrslice.com',
};

/**
 * Retrieve current website content settings
 */
export async function getContentSettings(): Promise<WebsiteContentSettings> {
  return IN_MEMORY_CONTENT_SETTINGS;
}

/**
 * Update website content settings with audit logging
 */
export async function updateContentSettings(
  updates: Partial<WebsiteContentSettings>,
  actor: { id: string; email: string; role: string } = {
    id: 'dev-superadmin-id',
    email: 'suraj@qrslice.com',
    role: 'super_admin',
  }
): Promise<{ success: boolean; settings: WebsiteContentSettings }> {
  const prev = { ...IN_MEMORY_CONTENT_SETTINGS };

  IN_MEMORY_CONTENT_SETTINGS = {
    ...prev,
    ...updates,
    announcementBar: { ...prev.announcementBar, ...(updates.announcementBar || {}) },
    seo: { ...prev.seo, ...(updates.seo || {}) },
    support: { ...prev.support, ...(updates.support || {}) },
    systemNotices: { ...prev.systemNotices, ...(updates.systemNotices || {}) },
    updatedAt: new Date().toISOString(),
    updatedBy: actor.email,
  };

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'content.settings_update',
    resourceType: 'system',
    resourceId: 'site-content-config',
    changesBefore: { ...prev },
    changesAfter: { ...IN_MEMORY_CONTENT_SETTINGS },
    metadata: {
      note: 'Website storefront announcement and content settings updated',
    },
  });

  return { success: true, settings: IN_MEMORY_CONTENT_SETTINGS };
}
