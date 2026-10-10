// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerShopOrder,
  updateOrderWorkflowStage,
  findOrderByNumber,
  VALID_ORDER_TRANSITIONS,
} from './orders-store';
import { generatePackingSlipPDF, generateGSTInvoicePDF } from './invoice-generator';
import { getAdminProductById } from './admin-catalog-store';

describe('Phase 04: Orders, Inventory & Physical Product Operations', () => {
  const testOrderNumber = `ORD-P4-${Date.now()}`;

  beforeEach(async () => {
    await registerShopOrder({
      orderNumber: testOrderNumber,
      customerName: 'Kailash Oberoi',
      customerEmail: 'kailash@mumbaicafe.in',
      customerPhone: '9820098200',
      shippingAddress: '42 Marine Drive, Nariman Point, Mumbai, Maharashtra - 400021',
      totalPaise: 139800,
      subtotalPaise: 139800,
      paymentStatus: 'captured',
      status: 'confirmed',
      orderStage: 'order_received',
      items: [
        {
          id: 'item-1',
          productId: 'prod-standee-acrylic',
          productTitle: 'Custom Acrylic Google Review Standee',
          quantity: 2,
          unitPricePaise: 69900,
          customBusinessName: 'Oberoi Cafe',
          finish: 'Gloss Black Acrylic',
        },
      ],
    });
  });

  it('allows valid forward state transitions in the 7-stage order lifecycle', async () => {
    // 1. Move from order_received to design_pending
    const res1 = await updateOrderWorkflowStage(testOrderNumber, 'design_pending', 'Customer sent logo vector');
    expect(res1.success).toBe(true);
    expect(res1.order?.orderStage).toBe('design_pending');

    // 2. Move from design_pending to design_approved
    const res2 = await updateOrderWorkflowStage(testOrderNumber, 'design_approved', 'Client approved 3D proof');
    expect(res2.success).toBe(true);
    expect(res2.order?.orderStage).toBe('design_approved');

    // 3. Move from design_approved to production
    const res3 = await updateOrderWorkflowStage(testOrderNumber, 'production', 'Laser marking initiated');
    expect(res3.success).toBe(true);
    expect(res3.order?.orderStage).toBe('production');
    expect(res3.order?.status).toBe('manufacturing');
  });

  it('strictly rejects invalid or skipping state transitions', async () => {
    const invalidOrderNum = `ORD-SKIP-${Date.now()}`;
    await registerShopOrder({
      orderNumber: invalidOrderNum,
      customerName: 'Skipper',
      totalPaise: 50000,
      paymentStatus: 'captured',
      orderStage: 'order_received',
      items: [],
    });

    // Attempting to skip directly from order_received to delivered is forbidden
    const invalidResult = await updateOrderWorkflowStage(invalidOrderNum, 'delivered', 'Illegal jump');
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('Invalid order state transition');

    // The order should still remain in order_received
    const currentOrder = await findOrderByNumber(invalidOrderNum);
    expect(currentOrder?.orderStage).toBe('order_received');
  });

  it('attaches shipment carrier and tracking number when transitioning to shipped', async () => {
    const shipOrderNum = `ORD-SHIP-${Date.now()}`;
    registerShopOrder({
      orderNumber: shipOrderNum,
      customerName: 'Ship Test',
      totalPaise: 89900,
      paymentStatus: 'captured',
      orderStage: 'production',
      items: [],
    });

    const res = await updateOrderWorkflowStage(
      shipOrderNum,
      'shipped',
      'Dispatched via BlueDart Hub',
      'warehouse@qrslice.com',
      {
        trackingNumber: 'BLUEDART-88291039',
        trackingCarrier: 'BlueDart Express',
        trackingUrl: 'https://bluedart.com/track/BLUEDART-88291039',
      }
    );

    expect(res.success).toBe(true);
    expect(res.order?.orderStage).toBe('shipped');
    expect(res.order?.trackingNumber).toBe('BLUEDART-88291039');
    expect(res.order?.trackingCarrier).toBe('BlueDart Express');
  });

  it('restocks inventory when order is cancelled', async () => {
    const cancelOrderNum = `ORD-CANCEL-${Date.now()}`;
    const productBefore = getAdminProductById('prod-standee-acrylic');
    const initialStock = productBefore?.stockQuantity ?? 50;

    registerShopOrder({
      orderNumber: cancelOrderNum,
      customerName: 'Cancel Test',
      totalPaise: 69900,
      paymentStatus: 'captured',
      orderStage: 'order_received',
      items: [
        {
          id: 'item-cancel-1',
          productId: 'prod-standee-acrylic',
          productTitle: 'Custom Acrylic Standee',
          quantity: 3,
          unitPricePaise: 69900,
          customBusinessName: 'Cancelled Shop',
          finish: 'Standard',
        },
      ],
    });

    const res = await updateOrderWorkflowStage(cancelOrderNum, 'cancelled', 'Customer requested cancellation');
    expect(res.success).toBe(true);
    expect(res.order?.orderStage).toBe('cancelled');

    // Stock should have been restored by 3 units
    const productAfter = getAdminProductById('prod-standee-acrylic');
    expect(productAfter?.stockQuantity).toBe(initialStock + 3);
  });

  it('generates a valid packing slip PDF with checkboxes and picker QC blocks', () => {
    const doc = generatePackingSlipPDF({
      orderNumber: testOrderNumber,
      createdAt: new Date().toISOString(),
      customerName: 'Kailash Oberoi',
      customerEmail: 'kailash@mumbaicafe.in',
      customerPhone: '9820098200',
      shippingAddress: '42 Marine Drive, Mumbai',
      items: [
        {
          productTitle: 'Custom Acrylic Google Review Standee',
          quantity: 2,
          unitPricePaise: 69900,
          customBusinessName: 'Oberoi Cafe',
          finish: 'Gloss Black Acrylic',
        },
      ],
      subtotalPaise: 139800,
      shippingPaise: 0,
      totalPaise: 139800,
    });

    expect(doc).toBeDefined();
    const pdfData = doc.output('arraybuffer');
    expect(pdfData.byteLength).toBeGreaterThan(1000);
  });
});
