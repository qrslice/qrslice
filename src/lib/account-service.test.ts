import { describe, it, expect } from 'vitest';
import {
  getAccountOrders,
  getAccountCards,
  updateCustomerCardDestination,
} from './account-service';
import { registerShopOrder } from './orders-store';

describe('account-service', () => {
  it('fetches customer orders by clerk user id or email', async () => {
    await registerShopOrder({
      id: 'test-order-clerk',
      orderNumber: 'ORD-TEST-99',
      clerkUserId: 'user_test_123',
      customerName: 'Test Buyer',
      customerEmail: 'testbuyer@example.com',
      customerPhone: '9876543210',
      shippingAddress: '123 Test St, Mumbai',
      totalPaise: 99900,
      paymentStatus: 'captured',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          productTitle: 'NFC Card',
          quantity: 1,
          unitPricePaise: 99900,
          customBusinessName: 'Test Brand',
          finish: 'Matte',
        },
      ],
    });

    const orders = await getAccountOrders('user_test_123');
    expect(orders.length).toBeGreaterThanOrEqual(1);
    expect(orders[0].orderNumber).toBe('ORD-TEST-99');
  });

  it('fetches customer active hardware cards', async () => {
    const cards = await getAccountCards('user_test_123');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].cardId).toMatch(/^QS-/);
    expect(cards[0].status).toBe('active');
  });

  it('updates customer device destination smoothly', async () => {
    const res = await updateCustomerCardDestination(
      'QS-8K2M9P4',
      'custom_url',
      'https://myshopify.com'
    );
    expect(res.success).toBe(true);
    expect(res.card?.purpose).toBe('custom_url');
    expect(res.card?.destinationUrl).toBe('https://myshopify.com');
  });

  it('returns error when updating nonexistent card', async () => {
    const res = await updateCustomerCardDestination(
      'QS-0000000',
      'reputation'
    );
    expect(res.success).toBe(false);
    expect(res.error).toBe('Device not found');
  });
});
