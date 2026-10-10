// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect } from 'vitest';
import { getAdminDashboardStats } from './admin-stats-service';
import { MOCK_ADMIN_ORDERS, AdminOrderView } from './orders-store';

describe('admin-stats-service', () => {
  it('calculates gross revenue strictly from paid/captured orders, excluding pending/failed', () => {
    // Add a temporary pending order and a failed order to MOCK_ADMIN_ORDERS
    const pendingOrder: AdminOrderView = {
      id: 'test-pending-1',
      orderNumber: 'ORD-TEST-PENDING',
      customerName: 'Test Abandoned',
      customerEmail: 'abandoned@test.com',
      customerPhone: '9999999999',
      shippingAddress: '123 Road',
      totalPaise: 500000, // ₹5,000 pending checkout
      paymentStatus: 'pending',
      status: 'pending',
      orderStage: 'order_received',
      refundedPaise: 0,
      createdAt: new Date().toISOString(),
      items: [],
    };

    const failedOrder: AdminOrderView = {
      id: 'test-failed-1',
      orderNumber: 'ORD-TEST-FAILED',
      customerName: 'Test Failed',
      customerEmail: 'failed@test.com',
      customerPhone: '9999999999',
      shippingAddress: '123 Road',
      totalPaise: 250000, // ₹2,500 failed payment
      paymentStatus: 'failed',
      status: 'cancelled',
      orderStage: 'cancelled',
      refundedPaise: 0,
      createdAt: new Date().toISOString(),
      items: [],
    };

    MOCK_ADMIN_ORDERS.push(pendingOrder, failedOrder);

    const stats = getAdminDashboardStats('all');

    // Remove them after computing
    const pendingIdx = MOCK_ADMIN_ORDERS.findIndex((o) => o.id === 'test-pending-1');
    if (pendingIdx >= 0) MOCK_ADMIN_ORDERS.splice(pendingIdx, 1);
    const failedIdx = MOCK_ADMIN_ORDERS.findIndex((o) => o.id === 'test-failed-1');
    if (failedIdx >= 0) MOCK_ADMIN_ORDERS.splice(failedIdx, 1);

    // Verify stats financials
    // The ₹5,000 pending and ₹2,500 failed amounts must NOT be counted in grossSalesPaise
    const capturedOrders = MOCK_ADMIN_ORDERS.filter(
      (o) => o.paymentStatus === 'captured' || o.paymentStatus === 'refunded' || o.paymentStatus === 'partially_refunded'
    );
    const expectedGross = capturedOrders.reduce((sum, o) => sum + o.totalPaise, 0);

    expect(stats.financials.grossSalesPaise).toBe(expectedGross);
    expect(stats.financials.failedPaymentsCount).toBeGreaterThanOrEqual(1);
  });

  it('computes net revenue correctly after deducting refunds', () => {
    const stats = getAdminDashboardStats('all');
    expect(stats.financials.netRevenuePaise).toBe(
      Math.max(0, stats.financials.grossSalesPaise - stats.financials.refundsPaise)
    );
  });

  it('computes inventory valuation and identifies low-stock items correctly', () => {
    const stats = getAdminDashboardStats('all');
    expect(stats.inventory.totalStockUnits).toBeGreaterThan(0);
    expect(stats.inventory.inventoryValuationPaise).toBeGreaterThan(0);
    expect(Array.isArray(stats.inventory.lowStockItems)).toBe(true);
  });
});
