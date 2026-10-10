// Copyright (c) 2026 QRslice. All rights reserved.
// Financial ledger, Razorpay reconciliation, GST breakdowns, and revenue separation.

export interface FinanceTransaction {
  id: string;
  type: 'physical_order' | 'subscription_renewal' | 'refund';
  referenceId: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  grossAmountPaise: number;
  gstPaise: number;        // 18% GST portion
  gatewayFeePaise: number; // ~2% Razorpay fee
  netSettledPaise: number;
  status: 'captured' | 'refunded' | 'failed';
  paymentMethod: 'upi' | 'card' | 'netbanking';
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

const IN_MEMORY_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: 'tx-001',
    type: 'physical_order',
    referenceId: 'ORD-2026-X8Y7K2',
    razorpayPaymentId: 'pay_RPZ_ORD_X8Y7K2',
    razorpayOrderId: 'order_RPZ_ORD_991',
    grossAmountPaise: 139800,
    gstPaise: 0,
    gatewayFeePaise: 3299,
    netSettledPaise: 136501,
    status: 'captured',
    paymentMethod: 'upi',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@glowsalon.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'tx-002',
    type: 'physical_order',
    referenceId: 'ORD-2026-M4P9Q1',
    razorpayPaymentId: 'pay_RPZ_ORD_M4P9Q1',
    razorpayOrderId: 'order_RPZ_ORD_992',
    grossAmountPaise: 99900,
    gstPaise: 0,
    gatewayFeePaise: 2357,
    netSettledPaise: 97543,
    status: 'captured',
    paymentMethod: 'upi',
    customerName: 'Karan Mehra',
    customerEmail: 'karan@ironfitness.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'tx-003',
    type: 'physical_order',
    referenceId: 'ORD-2026-B2C5R8',
    razorpayPaymentId: 'pay_RPZ_ORD_B2C5R8',
    razorpayOrderId: 'order_RPZ_ORD_993',
    grossAmountPaise: 129800,
    gstPaise: 0,
    gatewayFeePaise: 3063,
    netSettledPaise: 126737,
    status: 'captured',
    paymentMethod: 'card',
    customerName: 'Dr. Anita Roy',
    customerEmail: 'anita@apexcare.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'tx-004',
    type: 'subscription_renewal',
    referenceId: 'sub-apex-dental',
    razorpayPaymentId: 'pay_RPZ_SUB_APEX_ANNUAL',
    grossAmountPaise: 299900,
    gstPaise: 0,
    gatewayFeePaise: 7077,
    netSettledPaise: 292823,
    status: 'captured',
    paymentMethod: 'upi',
    customerName: 'Dr. Anita Roy',
    customerEmail: 'anita@apexcare.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'tx-005',
    type: 'subscription_renewal',
    referenceId: 'sub-glow-salon',
    razorpayPaymentId: 'pay_RPZ_SUB_GLOW_MO',
    grossAmountPaise: 29900,
    gstPaise: 0,
    gatewayFeePaise: 705,
    netSettledPaise: 29195,
    status: 'captured',
    paymentMethod: 'upi',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@glowsalon.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
];

export interface FinanceSummary {
  grossCollectedPaise: number;
  physicalRevenuePaise: number;
  subscriptionRevenuePaise: number;
  totalGstPaise: number;
  totalGatewayFeesPaise: number;
  totalRefundsPaise: number;
  netSettledPaise: number;
  transactionCount: number;
  transactions: FinanceTransaction[];
}

/**
 * Record a finance transaction into the ledger
 */
export async function recordFinanceTransaction(tx: FinanceTransaction): Promise<void> {
  const existingIdx = IN_MEMORY_FINANCE_TRANSACTIONS.findIndex((t) => t.id === tx.id || (t.razorpayPaymentId && t.razorpayPaymentId === tx.razorpayPaymentId));
  if (existingIdx >= 0) {
    IN_MEMORY_FINANCE_TRANSACTIONS[existingIdx] = tx;
  } else {
    IN_MEMORY_FINANCE_TRANSACTIONS.unshift(tx);
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
      const supabase = createSupabaseAdmin();
      await supabase.from('super_finance_transactions').upsert({
        id: tx.id,
        transaction_type: tx.type,
        reference_id: tx.referenceId,
        razorpay_payment_id: tx.razorpayPaymentId,
        razorpay_order_id: tx.razorpayOrderId,
        gross_amount_paise: tx.grossAmountPaise,
        gst_paise: tx.gstPaise,
        fee_paise: tx.gatewayFeePaise,
        net_amount_paise: tx.netSettledPaise,
        payment_method: tx.paymentMethod,
        status: tx.status,
        customer_name: tx.customerName,
        customer_email: tx.customerEmail,
        created_at: tx.createdAt,
      });
    } catch (err) {
      console.warn('[admin-finance-store] Supabase upsert error:', err);
    }
  }
}

/**
 * Computes financial ledger metrics separated by stream (Physical vs Subscriptions)
 */
export async function getFinanceLedger(params?: {
  period?: 'today' | '7d' | '30d' | 'this_month' | 'all';
  type?: 'all' | 'physical_order' | 'subscription_renewal' | 'refund';
}): Promise<FinanceSummary> {
  let list = [...IN_MEMORY_FINANCE_TRANSACTIONS];

  // Try to supplement from Supabase if configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
      const supabase = createSupabaseAdmin();
      const { data: dbTxns } = await supabase
        .from('super_finance_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbTxns && dbTxns.length > 0) {
        const mappedDbTxns: FinanceTransaction[] = dbTxns.map((row: any) => ({
          id: row.id,
          type: row.transaction_type || 'physical_order',
          referenceId: row.reference_id || '',
          razorpayPaymentId: row.razorpay_payment_id || '',
          razorpayOrderId: row.razorpay_order_id,
          grossAmountPaise: row.gross_amount_paise || 0,
          gstPaise: row.gst_paise || 0,
          gatewayFeePaise: row.fee_paise || 0,
          netSettledPaise: row.net_amount_paise || 0,
          status: row.status || 'captured',
          paymentMethod: row.payment_method || 'upi',
          customerName: row.customer_name || 'Customer',
          customerEmail: row.customer_email || '',
          createdAt: row.created_at || new Date().toISOString(),
        }));

        // Merge DB txns with in-memory (DB takes precedence or adds unique)
        const seenIds = new Set<string>();
        const merged: FinanceTransaction[] = [];
        for (const tx of [...mappedDbTxns, ...list]) {
          if (!seenIds.has(tx.id)) {
            seenIds.add(tx.id);
            merged.push(tx);
          }
        }
        list = merged;
      }
    } catch (err) {
      console.warn('[admin-finance-store] Failed to read from Supabase super_finance_transactions:', err);
    }
  }

  // Date filtering
  const now = new Date();
  if (params?.period && params.period !== 'all') {
    let cutoff: Date;
    switch (params.period) {
      case 'today':
        cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'this_month':
        cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        cutoff = new Date(0);
    }
    list = list.filter((tx) => new Date(tx.createdAt) >= cutoff);
  }

  if (params?.type && params.type !== 'all') {
    list = list.filter((tx) => tx.type === params.type);
  }

  let grossCollectedPaise = 0;
  let physicalRevenuePaise = 0;
  let subscriptionRevenuePaise = 0;
  let totalGstPaise = 0;
  let totalGatewayFeesPaise = 0;
  let totalRefundsPaise = 0;
  let netSettledPaise = 0;

  for (const tx of list) {
    if (tx.status === 'captured') {
      grossCollectedPaise += tx.grossAmountPaise;
      totalGstPaise += tx.gstPaise;
      totalGatewayFeesPaise += tx.gatewayFeePaise;
      netSettledPaise += tx.netSettledPaise;

      if (tx.type === 'physical_order') {
        physicalRevenuePaise += tx.grossAmountPaise;
      } else if (tx.type === 'subscription_renewal') {
        subscriptionRevenuePaise += tx.grossAmountPaise;
      }
    } else if (tx.status === 'refunded') {
      totalRefundsPaise += tx.grossAmountPaise;
    }
  }

  return {
    grossCollectedPaise,
    physicalRevenuePaise,
    subscriptionRevenuePaise,
    totalGstPaise,
    totalGatewayFeesPaise,
    totalRefundsPaise,
    netSettledPaise,
    transactionCount: list.length,
    transactions: list,
  };
}
