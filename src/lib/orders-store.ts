import { recordAuditLog } from './audit-service';

export type OrderWorkflowStage =
  | 'order_received'
  | 'design_pending'
  | 'design_approved'
  | 'ready_to_print'
  | 'production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItemView {
  id: string;
  productId?: string;
  productSlug?: string;
  productTitle: string;
  quantity: number;
  unitPricePaise: number;
  customBusinessName: string;
  customLogoUrl?: string;
  finish: string;
  batchId?: string;
  destinationUrl?: string;
  assignedCardIds?: string[];
  printedClaimTokens?: string[];
}

export interface InternalOrderNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface OrderTimelineEvent {
  stage: OrderWorkflowStage;
  note: string;
  timestamp: string;
  actor?: string;
}

export interface AdminOrderView {
  id: string;
  orderNumber: string;
  clerkUserId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  gstin?: string;
  businessLegalName?: string;
  totalPaise: number;
  subtotalPaise?: number;
  discountPaise?: number;
  couponCode?: string;
  shippingPaise?: number;
  paymentStatus: 'pending' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
  status: 'pending' | 'confirmed' | 'manufacturing' | 'shipped' | 'delivered' | 'cancelled';
  orderStage: OrderWorkflowStage;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  refundedPaise?: number;
  refundReason?: string;
  refundAuthorizedBy?: string;
  internalNotes?: InternalOrderNote[];
  timeline?: OrderTimelineEvent[];
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  packingSlipGeneratedAt?: string;
  createdAt: string;
  items: OrderItemView[];
}

// In-memory persistent order registry for dev and testing
export const MOCK_ADMIN_ORDERS: AdminOrderView[] = [
  {
    id: 'ord-mock-1',
    orderNumber: 'ORD-2026-X8Y7K2',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@glowsalon.com',
    customerPhone: '9811223344',
    shippingAddress: 'Shop 14, Galleria Market, DLF Phase 4, Gurugram, 122009',
    totalPaise: 139800,
    subtotalPaise: 139800,
    shippingPaise: 0,
    paymentStatus: 'captured',
    status: 'manufacturing',
    orderStage: 'production',
    refundedPaise: 0,
    trackingNumber: 'BLUEDART-882391029',
    trackingCarrier: 'BlueDart Express',
    trackingUrl: 'https://www.bluedart.com/tracking?track=BLUEDART-882391029',
    createdAt: new Date().toISOString(),
    internalNotes: [
      {
        id: 'note-1',
        text: 'Customer requested laser engraving preview on WhatsApp (declined per policy, preview confirmed on web customizer).',
        author: 'support@qrslice.com',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    timeline: [
      { stage: 'order_received', note: 'Order placed and paid via Razorpay UPI', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { stage: 'design_approved', note: 'Vector logo and Google Review link validated', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { stage: 'production', note: 'Transferred to acrylic fabrication queue', timestamp: new Date().toISOString() },
    ],
    items: [
      {
        id: 'item-101',
        productId: 'prod-standee-1',
        productSlug: 'google-review-standee',
        productTitle: 'Tap-to-Book Salon & Spa Counter Standee',
        quantity: 2,
        unitPricePaise: 69900,
        customBusinessName: 'Glow Beauty Lounge',
        finish: 'Rose Gold Accent',
      },
    ],
  },
  {
    id: 'ord-mock-2',
    orderNumber: 'ORD-2026-M4P9Q1',
    customerName: 'Karan Mehra',
    customerEmail: 'karan@ironfitness.in',
    customerPhone: '9988776655',
    shippingAddress: '42 Ring Road, Lajpat Nagar 3, New Delhi, 110024',
    totalPaise: 99900,
    subtotalPaise: 99900,
    shippingPaise: 0,
    paymentStatus: 'captured',
    status: 'shipped',
    orderStage: 'shipped',
    refundedPaise: 0,
    trackingNumber: 'DELHIVERY-99201948',
    trackingCarrier: 'Delhivery Surface',
    trackingUrl: 'https://www.delhivery.com/track/package/DELHIVERY-99201948',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    timeline: [
      { stage: 'order_received', note: 'Order confirmed and paid', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { stage: 'ready_to_print', note: 'Laser markings compiled', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
      { stage: 'shipped', note: 'Handed over to Delhivery logistics partner', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
    ],
    items: [
      {
        id: 'item-102',
        productId: 'prod-metal-card',
        productSlug: 'matte-black-metal-card',
        productTitle: 'Custom Matte Black Metal NFC Card',
        quantity: 1,
        unitPricePaise: 99900,
        customBusinessName: 'Ironclad Athletic Club',
        finish: 'Matte Stealth Black',
      },
    ],
  },
  {
    id: 'ord-mock-3',
    orderNumber: 'ORD-2026-B3K8V9',
    customerName: 'Dr. Anita Roy',
    customerEmail: 'anita@apexcare.in',
    customerPhone: '9876543210',
    shippingAddress: 'Suite 201, Medicare Tower, Indiranagar, Bengaluru, 560038',
    totalPaise: 129800,
    subtotalPaise: 129800,
    shippingPaise: 0,
    paymentStatus: 'captured',
    status: 'delivered',
    orderStage: 'delivered',
    refundedPaise: 0,
    trackingNumber: 'BLUEDART-55102941',
    trackingCarrier: 'BlueDart Express',
    trackingUrl: 'https://www.bluedart.com/tracking?track=BLUEDART-55102941',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    timeline: [
      { stage: 'order_received', note: 'Paid with corporate card', timestamp: new Date(Date.now() - 3600000 * 72).toISOString() },
      { stage: 'shipped', note: 'Dispatched via BlueDart Priority Air', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
      { stage: 'delivered', note: 'Signed and delivered at reception desk', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
    ],
    items: [
      {
        id: 'item-103',
        productId: 'prod-plaque-bamboo',
        productSlug: 'eco-bamboo-plaque',
        productTitle: 'Eco-Bamboo Smart Review Plaque',
        quantity: 1,
        unitPricePaise: 129800,
        customBusinessName: 'Apex Dental Care',
        finish: 'Natural Bamboo & Brass',
      },
    ],
  },
];

/**
 * Register a newly placed order into the store
 */
function mapDbOrderToAdminView(dbOrder: any): AdminOrderView {
  const memoryOrder = MOCK_ADMIN_ORDERS.find(
    (o) => o.orderNumber.toUpperCase() === String(dbOrder.order_number).toUpperCase()
  );

  const items: OrderItemView[] = (dbOrder.shop_order_items && dbOrder.shop_order_items.length > 0)
    ? dbOrder.shop_order_items.map((it: any) => ({
        id: it.id,
        productId: it.product_id,
        productTitle: it.custom_business_name || 'Hardware Product',
        quantity: it.quantity,
        unitPricePaise: it.unit_price_paise,
        customBusinessName: it.custom_business_name,
        customLogoUrl: it.custom_logo_url,
        finish: it.finish,
        destinationUrl: it.destination_url,
        assignedCardIds: it.assigned_card_ids || [],
        printedClaimTokens: it.printed_claim_tokens || [],
      }))
    : (memoryOrder?.items || []);

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    clerkUserId: dbOrder.clerk_user_id || undefined,
    customerName: dbOrder.customer_name,
    customerEmail: dbOrder.customer_email,
    customerPhone: dbOrder.customer_phone,
    shippingAddress: typeof dbOrder.shipping_address === 'object' && dbOrder.shipping_address !== null
      ? (dbOrder.shipping_address.formatted || JSON.stringify(dbOrder.shipping_address))
      : String(dbOrder.shipping_address || ''),
    gstin: dbOrder.gstin || undefined,
    businessLegalName: dbOrder.business_legal_name || undefined,
    totalPaise: dbOrder.total_paise,
    subtotalPaise: dbOrder.subtotal_paise || dbOrder.total_paise,
    shippingPaise: dbOrder.shipping_paise || 0,
    paymentStatus: dbOrder.payment_status,
    status: dbOrder.status,
    orderStage: dbOrder.order_stage || 'order_received',
    razorpayOrderId: dbOrder.razorpay_order_id || undefined,
    razorpayPaymentId: dbOrder.razorpay_payment_id || undefined,
    refundedPaise: dbOrder.refunded_paise || 0,
    refundReason: dbOrder.refund_reason || undefined,
    refundAuthorizedBy: dbOrder.refund_authorized_by || undefined,
    internalNotes: dbOrder.internal_notes || [],
    trackingNumber: dbOrder.tracking_number || undefined,
    trackingCarrier: dbOrder.tracking_carrier || undefined,
    createdAt: dbOrder.created_at,
    items,
  };
}

export async function registerShopOrder(order: Partial<AdminOrderView>): Promise<AdminOrderView> {
  const fullOrder: AdminOrderView = {
    id: order.id || `ord-${Date.now()}`,
    orderNumber: order.orderNumber || `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    clerkUserId: order.clerkUserId,
    customerName: order.customerName || 'Customer',
    customerEmail: order.customerEmail || 'customer@example.com',
    customerPhone: order.customerPhone || '9999999999',
    shippingAddress: order.shippingAddress || '',
    gstin: order.gstin,
    businessLegalName: order.businessLegalName,
    totalPaise: order.totalPaise || 0,
    subtotalPaise: order.subtotalPaise || order.totalPaise || 0,
    discountPaise: order.discountPaise || 0,
    couponCode: order.couponCode,
    shippingPaise: order.shippingPaise || 0,
    paymentStatus: order.paymentStatus || 'pending',
    status: order.status || 'pending',
    orderStage: order.orderStage || 'order_received',
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    refundedPaise: 0,
    internalNotes: [],
    timeline: [
      {
        stage: 'order_received',
        note: order.paymentStatus === 'captured'
          ? 'Order confirmed and verified via Razorpay checkout.'
          : 'Order initiated, awaiting Razorpay payment confirmation.',
        timestamp: new Date().toISOString(),
      },
    ],
    items: order.items || [],
    createdAt: order.createdAt || new Date().toISOString(),
  };

  const existingIdx = MOCK_ADMIN_ORDERS.findIndex(
    (o) => o.orderNumber.toUpperCase() === fullOrder.orderNumber.toUpperCase()
  );
  if (existingIdx >= 0) {
    MOCK_ADMIN_ORDERS[existingIdx] = fullOrder;
  } else {
    MOCK_ADMIN_ORDERS.unshift(fullOrder);
  }

  // Supabase is the authoritative source of truth
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
    const supabase = createSupabaseAdmin();
    const { data: dbOrder, error: orderErr } = await supabase
      .from('shop_orders')
      .upsert(
        {
          order_number: fullOrder.orderNumber,
          customer_name: fullOrder.customerName,
          customer_email: fullOrder.customerEmail,
          customer_phone: fullOrder.customerPhone,
          shipping_address: { formatted: fullOrder.shippingAddress },
          total_paise: fullOrder.totalPaise,
          subtotal_paise: fullOrder.subtotalPaise,
          shipping_paise: fullOrder.shippingPaise,
          payment_status: fullOrder.paymentStatus,
          status: fullOrder.status,
          order_stage: fullOrder.orderStage,
          razorpay_order_id: fullOrder.razorpayOrderId || null,
          razorpay_payment_id: fullOrder.razorpayPaymentId || null,
          clerk_user_id: fullOrder.clerkUserId || null,
          gstin: fullOrder.gstin || null,
          business_legal_name: fullOrder.businessLegalName || null,
          created_at: fullOrder.createdAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'order_number' }
      )
      .select('id')
      .single();

    if (orderErr) {
      console.error('[orders-store] Supabase order sync failed:', orderErr);
      throw new Error(`Failed to store order in database: ${orderErr.message}`);
    }

    if (dbOrder && fullOrder.items && fullOrder.items.length > 0) {
      for (const it of fullOrder.items) {
        try {
          const itemPayload: any = {
            order_id: dbOrder.id,
            quantity: it.quantity,
            unit_price_paise: it.unitPricePaise,
            custom_business_name: it.customBusinessName,
            custom_logo_url: it.customLogoUrl || null,
            finish: it.finish,
            destination_url: it.destinationUrl || null,
            assigned_card_ids: it.assignedCardIds || [],
            printed_claim_tokens: it.printedClaimTokens || [],
          };
          if (it.productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.productId)) {
            itemPayload.product_id = it.productId;
          }
          await supabase.from('shop_order_items').insert(itemPayload);
        } catch (itemErr) {
          console.warn('[orders-store] Supabase order item sync warning:', itemErr);
        }
      }
    }
  }

  return fullOrder;
}

/**
 * Mark an order as paid after cryptographic verification of Razorpay signature
 */
export async function markOrderPaid(
  orderNumber: string,
  paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amountPaise: number;
  }
): Promise<AdminOrderView | null> {
  const norm = orderNumber.toUpperCase().trim();
  const order = MOCK_ADMIN_ORDERS.find((o) => o.orderNumber.toUpperCase() === norm);

  if (order) {
    order.paymentStatus = 'captured';
    order.status = 'confirmed';
    order.razorpayOrderId = paymentDetails.razorpayOrderId;
    order.razorpayPaymentId = paymentDetails.razorpayPaymentId;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      stage: 'order_received',
      note: `Payment verified via Razorpay (${paymentDetails.razorpayPaymentId})`,
      timestamp: new Date().toISOString(),
      actor: 'system.razorpay',
    });
  }

  // Database persistence
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
      const supabase = createSupabaseAdmin();
      const { data, error } = await supabase
        .from('shop_orders')
        .update({
          payment_status: 'captured',
          status: 'confirmed',
          razorpay_order_id: paymentDetails.razorpayOrderId,
          razorpay_payment_id: paymentDetails.razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', norm)
        .select('*, shop_order_items(*)')
        .maybeSingle();

      if (data && !error) {
        return mapDbOrderToAdminView(data);
      }
    } catch (err) {
      console.warn('[orders-store] Supabase markOrderPaid sync warning:', err);
    }
  }

  return order || null;
}

export const VALID_ORDER_TRANSITIONS: Record<OrderWorkflowStage, OrderWorkflowStage[]> = {
  order_received: ['design_pending', 'design_approved', 'cancelled'],
  design_pending: ['design_approved', 'cancelled'],
  design_approved: ['ready_to_print', 'production', 'cancelled'],
  ready_to_print: ['production', 'cancelled'],
  production: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

/**
 * Advance or update an order's workflow stage following explicit state transition rules
 */
export async function updateOrderWorkflowStage(
  orderId: string,
  newStage: OrderWorkflowStage,
  noteText?: string,
  actorEmail: string = 'suraj@qrslice.com',
  shippingDetails?: {
    trackingNumber?: string;
    trackingCarrier?: string;
    trackingUrl?: string;
  }
): Promise<{ success: boolean; order?: AdminOrderView; error?: string }> {
  const order = MOCK_ADMIN_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return { success: false, error: 'Order not found' };

  const previousStage = order.orderStage;

  // Validate state transition
  if (newStage !== previousStage) {
    const allowed = VALID_ORDER_TRANSITIONS[previousStage] || [];
    if (!allowed.includes(newStage)) {
      return {
        success: false,
        error: `Invalid order state transition from '${previousStage}' to '${newStage}'. Allowed next stages: ${allowed.join(', ') || 'none (terminal state)'}.`,
      };
    }
  }

  order.orderStage = newStage;

  // Map stage to legacy status field for backwards compatibility
  if (newStage === 'production' || newStage === 'ready_to_print') {
    order.status = 'manufacturing';
  } else if (newStage === 'shipped') {
    order.status = 'shipped';
    if (shippingDetails?.trackingNumber) order.trackingNumber = shippingDetails.trackingNumber;
    if (shippingDetails?.trackingCarrier) order.trackingCarrier = shippingDetails.trackingCarrier;
    if (shippingDetails?.trackingUrl) order.trackingUrl = shippingDetails.trackingUrl;
  } else if (newStage === 'delivered') {
    order.status = 'delivered';
  } else if (newStage === 'cancelled') {
    order.status = 'cancelled';

    // Restock items in inventory upon cancellation
    try {
      const { adjustProductStock } = await import('@/lib/admin-catalog-store');
      for (const it of order.items) {
        if (it.productId) {
          await adjustProductStock(
            it.productId,
            {
              delta: it.quantity,
              reason: 'customer_return',
              notes: `Restocked upon cancellation of order ${order.orderNumber}`,
            },
            actorEmail
          );
        }
      }
    } catch (err) {
      console.warn('[orders-store] Stock restock on cancellation error:', err);
    }
  }

  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    stage: newStage,
    note: noteText || `Stage changed from ${previousStage} to ${newStage}`,
    timestamp: new Date().toISOString(),
    actor: actorEmail,
  });

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail,
    actorRole: 'super_admin',
    action: 'order.stage_update',
    resourceType: 'order',
    resourceId: order.orderNumber,
    changesBefore: { orderStage: previousStage },
    changesAfter: { orderStage: newStage },
    metadata: {
      orderNumber: order.orderNumber,
      note: noteText,
      shippingDetails,
    },
  });

  // Sync with Supabase shop_orders if available
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
      const supabase = createSupabaseAdmin();
      await supabase
        .from('shop_orders')
        .update({
          order_stage: newStage,
          status: order.status,
          tracking_number: order.trackingNumber,
          tracking_carrier: order.trackingCarrier,
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', order.orderNumber);
    } catch (err) {
      console.warn('[orders-store] Supabase stage update sync warning:', err);
    }
  }

  return { success: true, order };
}

/**
 * Process a partial or full refund for an order
 */
export async function processOrderRefund(
  orderId: string,
  payload: {
    amountPaise: number;
    reason: string;
    authorizedBy: string;
  }
): Promise<{ success: boolean; order?: AdminOrderView; error?: string }> {
  const order = MOCK_ADMIN_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return { success: false, error: 'Order not found' };

  if (payload.amountPaise <= 0 || payload.amountPaise > order.totalPaise) {
    return { success: false, error: 'Invalid refund amount. Cannot exceed total order value.' };
  }

  const prevRefund = order.refundedPaise || 0;
  const newRefund = prevRefund + payload.amountPaise;
  order.refundedPaise = newRefund;
  order.refundReason = payload.reason;
  order.refundAuthorizedBy = payload.authorizedBy;

  if (newRefund >= order.totalPaise) {
    order.paymentStatus = 'refunded';
    order.orderStage = 'refunded';
  } else {
    order.paymentStatus = 'partially_refunded';
  }

  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    stage: 'refunded',
    note: `Refund of ₹${(payload.amountPaise / 100).toLocaleString('en-IN')} issued. Reason: ${payload.reason}`,
    timestamp: new Date().toISOString(),
    actor: payload.authorizedBy,
  });

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail: payload.authorizedBy,
    actorRole: 'super_admin',
    action: 'order.refund',
    resourceType: 'refund',
    resourceId: order.orderNumber,
    changesBefore: { refundedPaise: prevRefund, paymentStatus: 'captured' },
    changesAfter: { refundedPaise: newRefund, paymentStatus: order.paymentStatus },
    metadata: {
      orderNumber: order.orderNumber,
      amountPaise: payload.amountPaise,
      reason: payload.reason,
    },
  });

  return { success: true, order };
}

/**
 * Append an internal staff note to an order
 */
export async function addOrderInternalNote(
  orderId: string,
  noteText: string,
  author: string = 'suraj@qrslice.com'
): Promise<AdminOrderView | null> {
  const order = MOCK_ADMIN_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return null;

  if (!order.internalNotes) order.internalNotes = [];
  const newNote: InternalOrderNote = {
    id: `note-${Date.now()}`,
    text: noteText.trim(),
    author,
    createdAt: new Date().toISOString(),
  };

  order.internalNotes.unshift(newNote);

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail: author,
    actorRole: 'super_admin',
    action: 'order.note_add',
    resourceType: 'order',
    resourceId: order.orderNumber,
    changesAfter: { noteText },
    metadata: { orderNumber: order.orderNumber },
  });

  return order;
}

/**
 * Filter orders by date range
 */
export function filterOrdersByDate(
  orders: AdminOrderView[],
  period?: 'today' | '7d' | '30d' | 'this_month' | 'all',
  fromIso?: string,
  toIso?: string
): AdminOrderView[] {
  if (!period || period === 'all') {
    if (fromIso && toIso) {
      const from = new Date(fromIso).getTime();
      const to = new Date(toIso).getTime();
      return orders.filter((o) => {
        const time = new Date(o.createdAt).getTime();
        return time >= from && time <= to;
      });
    }
    return orders;
  }

  const now = new Date();
  let startTime = 0;

  if (period === 'today') {
    startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  } else if (period === '7d') {
    startTime = now.getTime() - 7 * 24 * 3600000;
  } else if (period === '30d') {
    startTime = now.getTime() - 30 * 24 * 3600000;
  } else if (period === 'this_month') {
    startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }

  return orders.filter((o) => new Date(o.createdAt).getTime() >= startTime);
}

/**
 * Query orders for customer
 */
export async function findCustomerOrders(clerkUserId?: string | null, email?: string | null): Promise<AdminOrderView[]> {
  const normalizedEmail = email?.trim().toLowerCase();

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
      const supabase = createSupabaseAdmin();
      let query = supabase.from('shop_orders').select('*, shop_order_items(*)');
      if (clerkUserId) {
        query = query.eq('clerk_user_id', clerkUserId);
      } else if (normalizedEmail) {
        query = query.eq('customer_email', normalizedEmail);
      }
      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        return data.map(mapDbOrderToAdminView);
      }
    } catch (err) {
      console.warn('[orders-store] Supabase findCustomerOrders warning:', err);
    }
  }

  return MOCK_ADMIN_ORDERS.filter((order) => {
    if (clerkUserId && order.clerkUserId === clerkUserId) {
      return true;
    }
    if (normalizedEmail && order.customerEmail.toLowerCase() === normalizedEmail) {
      return true;
    }
    return false;
  });
}

/**
 * Find order by orderNumber
 */
export async function findOrderByNumber(orderNumber: string): Promise<AdminOrderView | undefined> {
  const norm = orderNumber.toUpperCase().trim();

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
      const supabase = createSupabaseAdmin();
      const { data: dbOrder, error } = await supabase
        .from('shop_orders')
        .select('*, shop_order_items(*)')
        .eq('order_number', norm)
        .maybeSingle();

      if (dbOrder && !error) {
        return mapDbOrderToAdminView(dbOrder);
      }
    } catch (err) {
      console.warn('[orders-store] Supabase findOrderByNumber error:', err);
    }
  }

  return MOCK_ADMIN_ORDERS.find((o) => o.orderNumber.toUpperCase() === norm);
}
