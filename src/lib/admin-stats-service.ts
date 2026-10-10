import { MOCK_ADMIN_ORDERS, filterOrdersByDate, AdminOrderView, OrderWorkflowStage } from './orders-store';
import { getAdminProducts, AdminProduct } from './admin-catalog-store';
import { getAdminCustomers } from './admin-customer-store';

export interface DashboardMetricsResult {
  period: 'today' | '7d' | '30d' | 'this_month' | 'all';
  financials: {
    grossSalesPaise: number;
    refundsPaise: number;
    netRevenuePaise: number;
    averageOrderValuePaise: number;
    failedPaymentsCount: number;
  };
  orders: {
    total: number;
    byStage: Record<OrderWorkflowStage, number>;
  };
  customers: {
    totalCustomers: number;
    activeSubscribers: number;
  };
  inventory: {
    totalStockUnits: number;
    lowStockCount: number;
    inventoryValuationPaise: number;
    lowStockItems: { id: string; title: string; sku: string; stock: number; threshold: number }[];
  };
  recentOrders: AdminOrderView[];
}

/**
 * Compute real-time dashboard statistics backed by actual orders, catalogue and customer stores
 */
export function getAdminDashboardStats(
  period: 'today' | '7d' | '30d' | 'this_month' | 'all' = '30d'
): DashboardMetricsResult {
  const filteredOrders = filterOrdersByDate(MOCK_ADMIN_ORDERS, period);
  const allProducts = getAdminProducts();
  const allCustomers = getAdminCustomers();

  // Financial calculations - strictly calculate from verified paid orders (AGENTS.md rule)
  const paidOrders = filteredOrders.filter(
    (o) => o.paymentStatus === 'captured' || o.paymentStatus === 'refunded' || o.paymentStatus === 'partially_refunded'
  );
  const grossSalesPaise = paidOrders.reduce((sum, o) => sum + (o.totalPaise || 0), 0);
  const refundsPaise = paidOrders.reduce((sum, o) => sum + (o.refundedPaise || 0), 0);
  const netRevenuePaise = Math.max(0, grossSalesPaise - refundsPaise);
  const averageOrderValuePaise = paidOrders.length > 0 ? Math.round(grossSalesPaise / paidOrders.length) : 0;
  const failedPaymentsCount = filteredOrders.filter((o) => o.paymentStatus === 'failed').length;

  // Orders by 7 stages
  const byStage: Record<OrderWorkflowStage, number> = {
    order_received: 0,
    design_pending: 0,
    design_approved: 0,
    ready_to_print: 0,
    production: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };

  for (const o of filteredOrders) {
    const stage = o.orderStage || 'order_received';
    if (byStage[stage] !== undefined) {
      byStage[stage] += 1;
    } else {
      byStage.order_received += 1;
    }
  }

  // Inventory calculations
  let totalStockUnits = 0;
  let inventoryValuationPaise = 0;
  const lowStockItems: { id: string; title: string; sku: string; stock: number; threshold: number }[] = [];

  for (const p of allProducts) {
    if (!p.isArchived) {
      totalStockUnits += p.stockQuantity;
      inventoryValuationPaise += p.stockQuantity * p.costPricePaise;
      if (p.stockQuantity <= p.lowStockThreshold) {
        lowStockItems.push({
          id: p.id,
          title: p.title,
          sku: p.sku,
          stock: p.stockQuantity,
          threshold: p.lowStockThreshold,
        });
      }
    }
  }

  const activeSubscribers = allCustomers.filter((c) => c.subscriptionStatus === 'active' || c.subscriptionStatus === 'trialing').length;

  return {
    period,
    financials: {
      grossSalesPaise,
      refundsPaise,
      netRevenuePaise,
      averageOrderValuePaise,
      failedPaymentsCount,
    },
    orders: {
      total: filteredOrders.length,
      byStage,
    },
    customers: {
      totalCustomers: allCustomers.length,
      activeSubscribers,
    },
    inventory: {
      totalStockUnits,
      lowStockCount: lowStockItems.length,
      inventoryValuationPaise,
      lowStockItems,
    },
    recentOrders: filteredOrders.slice(0, 5),
  };
}
