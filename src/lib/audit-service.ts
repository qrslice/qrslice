// Audit service for tracking all super admin activities

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resourceType: 'product' | 'order' | 'inventory' | 'customer' | 'refund' | 'system';
  resourceId: string;
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

// In-memory persistent registry for local dev and fast rendering
const IN_MEMORY_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-seed-1',
    actorId: 'dev-superadmin-id',
    actorEmail: 'suraj@qrslice.com',
    actorRole: 'super_admin',
    action: 'product.stock_adjust',
    resourceType: 'inventory',
    resourceId: 'prod-standee-acrylic',
    changesBefore: { stock_quantity: 45 },
    changesAfter: { stock_quantity: 95 },
    metadata: { reason: 'New batch received from acrylic laser fabricator (+50 units)' },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'aud-seed-2',
    actorId: 'dev-superadmin-id',
    actorEmail: 'suraj@qrslice.com',
    actorRole: 'super_admin',
    action: 'order.stage_update',
    resourceType: 'order',
    resourceId: 'ORD-2026-X8Y7K2',
    changesBefore: { order_stage: 'design_approved' },
    changesAfter: { order_stage: 'production' },
    metadata: { note: 'Artwork imposed on SRA3 gang sheet. Sent to flatbed UV printer.' },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'aud-seed-3',
    actorId: 'dev-superadmin-id',
    actorEmail: 'suraj@qrslice.com',
    actorRole: 'super_admin',
    action: 'product.publish',
    resourceType: 'product',
    resourceId: 'combo-review-upi-instagram-standee',
    changesBefore: { is_active: false },
    changesAfter: { is_active: true },
    metadata: { note: 'Published 3-in-1 Triple Action Standee to live storefront.' },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

/**
 * Record an audit log entry in DB and memory
 */
export async function recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  IN_MEMORY_AUDIT_LOGS.unshift(fullEntry);

  try {
    const { createSupabaseAdmin } = await import('./supabase/admin');
    const supabase = createSupabaseAdmin();
    await supabase.from('super_audit_logs').insert({
      id: fullEntry.id,
      actor_id: fullEntry.actorId,
      actor_email: fullEntry.actorEmail,
      actor_role: fullEntry.actorRole,
      action: fullEntry.action,
      resource_type: fullEntry.resourceType,
      resource_id: fullEntry.resourceId,
      changes_before: fullEntry.changesBefore || {},
      changes_after: fullEntry.changesAfter || {},
      metadata: fullEntry.metadata || {},
      created_at: fullEntry.createdAt,
    });
  } catch {
    // Graceful fallback to memory during local testing without Supabase
  }

  return fullEntry;
}

/**
 * Query audit logs with filtering and pagination
 */
export async function getAuditLogs(params?: {
  resourceType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  let logs = [...IN_MEMORY_AUDIT_LOGS];

  if (params?.resourceType && params.resourceType !== 'all') {
    logs = logs.filter((l) => l.resourceType === params.resourceType);
  }

  const total = logs.length;
  const offset = params?.offset || 0;
  const limit = params?.limit || 50;
  const paginated = logs.slice(offset, offset + limit);

  return { logs: paginated, total };
}
