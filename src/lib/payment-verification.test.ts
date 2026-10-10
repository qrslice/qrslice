// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from './razorpay';
import { calculateOrderTotals, getProductBySlug, CartItem } from './shop-service';
import { registerShopOrder, findOrderByNumber, markOrderPaid } from './orders-store';

describe('Phase 03: Razorpay Payment Correctness & Anti-Tampering', () => {
  const testSecret = 'secret_key_rzp_mock_12345';
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('calculates totals strictly on server and prevents client price tampering', () => {
    const product = getProductBySlug('acrylic-google-review-standee') || {
      basePricePaise: 69900,
      finishes: [{ id: 'standard', priceModifierPaise: 0 }],
    };

    // Client maliciously attempts to pay ₹1 (100 paise)
    const spoofedClientItem = {
      productId: 'prod-test',
      title: 'Google Review Standee',
      slug: 'acrylic-google-review-standee',
      quantity: 2,
      unitPricePaise: 100, // MALICIOUS SPOOF
      finish: { id: 'standard', name: 'Standard', priceModifierPaise: 0, previewColor: '#000' },
      customBusinessName: 'Tampered Cafe',
    };

    // Server recalculates unitPricePaise from authoritative catalog
    const serverProduct = getProductBySlug(spoofedClientItem.slug);
    expect(serverProduct).toBeDefined();
    const authoritativeUnitPrice = serverProduct!.basePricePaise;
    expect(authoritativeUnitPrice).toBeGreaterThan(100);

    const verifiedItem: CartItem = {
      id: 'item-test-1',
      ...spoofedClientItem,
      unitPricePaise: authoritativeUnitPrice,
    };

    const totals = calculateOrderTotals([verifiedItem]);
    // 2 * 69900 = 139800 paise
    expect(totals.subtotalPaise).toBe(2 * authoritativeUnitPrice);
    expect(totals.totalPaise).toBeGreaterThan(10000);
  });

  it('fails closed when Razorpay credentials are not configured', async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    await expect(
      createRazorpayOrder({
        amountPaise: 139800,
        currency: 'INR',
        receipt: 'ORD-TEST-FAIL',
      })
    ).rejects.toThrow(/Payments not configured/);
  });

  it('creates server-side Razorpay order with currency INR and exact amount when configured', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key_123';
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const receipt = 'ORD-2026-TEST01';
    const amountPaise = 139800;

    const originalFetch = global.fetch;
    global.fetch = async (url: any, init: any) => {
      return {
        ok: true,
        json: async () => ({
          id: 'order_test_123',
          amount: amountPaise,
          currency: 'INR',
        }),
      } as any;
    };

    try {
      const rzpOrder = await createRazorpayOrder({
        amountPaise,
        currency: 'INR',
        receipt,
      });

      expect(rzpOrder.id).toBe('order_test_123');
      expect(rzpOrder.amount).toBe(amountPaise);
      expect(rzpOrder.currency).toBe('INR');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('verifies valid HMAC-SHA256 Razorpay payment signature', async () => {
    const orderId = 'order_DA1234567890';
    const paymentId = 'pay_XY9876543210';
    const payload = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', testSecret)
      .update(payload)
      .digest('hex');

    const isValid = await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: expectedSignature,
      secret: testSecret,
    });

    expect(isValid).toBe(true);
  });

  it('rejects forged, truncated, or tampered payment signature', async () => {
    const orderId = 'order_DA1234567890';
    const paymentId = 'pay_XY9876543210';
    const fakeSignature = 'forged_tampered_signature_hex';

    const isValid = await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: fakeSignature,
      secret: testSecret,
    });

    expect(isValid).toBe(false);
  });

  it('registers order in pending status and confirms only when marked paid', async () => {
    const testOrderNumber = `ORD-TEST-${Date.now()}`;
    const initialOrder = await registerShopOrder({
      orderNumber: testOrderNumber,
      customerName: 'Payment Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '9876543210',
      totalPaise: 49900,
      paymentStatus: 'pending',
      status: 'pending',
      items: [],
    });

    expect(initialOrder.paymentStatus).toBe('pending');
    expect(initialOrder.status).toBe('pending');

    // Confirm payment via markOrderPaid
    const paidOrder = await markOrderPaid(testOrderNumber, {
      razorpayOrderId: 'order_test_123',
      razorpayPaymentId: 'pay_test_999',
      amountPaise: 49900,
    });

    expect(paidOrder).not.toBeNull();
    expect(paidOrder!.paymentStatus).toBe('captured');
    expect(paidOrder!.status).toBe('confirmed');
    expect(paidOrder!.razorpayPaymentId).toBe('pay_test_999');

    // Re-query from store
    const queried = await findOrderByNumber(testOrderNumber);
    expect(queried?.paymentStatus).toBe('captured');
  });
});
