import { MOCK_ADMIN_ORDERS, AdminOrderView } from './orders-store';
import { recordAuditLog } from './audit-service';

export interface CustomerSupportNote {
  id: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface AdminCustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  totalSpentPaise: number;
  ordersCount: number;
  lastOrderDate: string;
  subscriptionPlan: 'Free' | 'Pro Monthly' | 'Pro Annual';
  subscriptionStatus: 'active' | 'trialing' | 'expired' | 'none';
  supportNotes: CustomerSupportNote[];
  orders: AdminOrderView[];
}

const IN_MEMORY_SUPPORT_NOTES: Record<string, CustomerSupportNote[]> = {
  'priya@glowsalon.com': [
    {
      id: 'sn-1',
      note: 'Requested priority dispatch for Gurgaon salon grand opening on Saturday.',
      author: 'support@qrslice.com',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ],
};

/**
 * Get all customers aggregated from real order records
 */
export function getAdminCustomers(query?: { search?: string }): AdminCustomerProfile[] {
  const map = new Map<string, AdminCustomerProfile>();

  for (const order of MOCK_ADMIN_ORDERS) {
    const emailKey = order.customerEmail.toLowerCase().trim();
    const existing = map.get(emailKey);
    const firstItem = order.items[0];
    const bizName = order.businessLegalName || firstItem?.customBusinessName || 'Independent Merchant';

    if (existing) {
      existing.totalSpentPaise += order.totalPaise;
      existing.ordersCount += 1;
      existing.orders.push(order);
      if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.createdAt;
      }
    } else {
      map.set(emailKey, {
        id: `cust-${emailKey.replace(/[^a-z0-9]/g, '_')}`,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        businessName: bizName,
        totalSpentPaise: order.totalPaise,
        ordersCount: 1,
        lastOrderDate: order.createdAt,
        subscriptionPlan: emailKey.includes('salon') ? 'Pro Monthly' : 'Free',
        subscriptionStatus: emailKey.includes('salon') ? 'active' : 'trialing',
        supportNotes: IN_MEMORY_SUPPORT_NOTES[emailKey] || [],
        orders: [order],
      });
    }
  }

  let list = Array.from(map.values());

  if (query?.search) {
    const q = query.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.businessName.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Get customer by email
 */
export function getAdminCustomerByEmail(email: string): AdminCustomerProfile | undefined {
  const all = getAdminCustomers();
  return all.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

/**
 * Append staff support note to customer record
 */
export async function addCustomerSupportNote(
  email: string,
  noteText: string,
  author: string = 'suraj@qrslice.com'
): Promise<CustomerSupportNote> {
  const emailKey = email.toLowerCase().trim();
  if (!IN_MEMORY_SUPPORT_NOTES[emailKey]) {
    IN_MEMORY_SUPPORT_NOTES[emailKey] = [];
  }

  const note: CustomerSupportNote = {
    id: `sn-${Date.now()}`,
    note: noteText.trim(),
    author,
    createdAt: new Date().toISOString(),
  };

  IN_MEMORY_SUPPORT_NOTES[emailKey].unshift(note);

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail: author,
    actorRole: 'super_admin',
    action: 'customer.note_add',
    resourceType: 'customer',
    resourceId: emailKey,
    changesAfter: { noteText },
    metadata: { customerEmail: emailKey },
  });

  return note;
}
