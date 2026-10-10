import { describe, it, expect } from 'vitest';
import {
  INITIAL_PRODUCTS,
  getProductBySlug,
  generateOrderNumber,
  calculateOrderTotals,
  ShippingAddressSchema,
  CustomizerSchema,
  CartItem,
} from './shop-service';

describe('shop-service', () => {
  it('has diversified products across all categories and verticals', () => {
    expect(INITIAL_PRODUCTS.length).toBeGreaterThanOrEqual(6);
    const categories = new Set(INITIAL_PRODUCTS.map((p) => p.category));
    expect(categories.has('standees')).toBe(true);
    expect(categories.has('cards')).toBe(true);
    expect(categories.has('plaques')).toBe(true);
    expect(categories.has('tags')).toBe(true);
  });

  it('retrieves products by valid slug', () => {
    const prod = getProductBySlug('google-review-nfc-standee');
    expect(prod).toBeDefined();
    expect(prod?.basePricePaise).toBe(69900);
    expect(prod?.finishes.length).toBeGreaterThan(0);
  });

  it('generates well-formatted Crockford order numbers', () => {
    const orderNum = generateOrderNumber();
    expect(orderNum).toMatch(/^ORD-202\d-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$/);
  });

  it('calculates order totals with free shipping threshold', () => {
    const dummyItem1: CartItem = {
      id: 'item-1',
      productId: 'prod-tag-keychain',
      title: 'Compact Epoxy NFC Smart Keychain',
      slug: 'epoxy-nfc-smart-keychain',
      quantity: 1,
      unitPricePaise: 39900,
      finish: { id: 'keychain-gloss-black', name: 'High-Gloss Obsidian', priceModifierPaise: 0, previewColor: '#18181b' },
      customBusinessName: 'Gym Pro',
    };

    // Below ₹999 threshold -> adds ₹79 shipping
    const res1 = calculateOrderTotals([dummyItem1]);
    expect(res1.subtotalPaise).toBe(39900);
    expect(res1.shippingPaise).toBe(7900);
    expect(res1.totalPaise).toBe(47800);

    // Quantity 3 -> ₹1,197 (above ₹999 threshold) -> Free shipping
    const dummyItem2: CartItem = { ...dummyItem1, quantity: 3 };
    const res2 = calculateOrderTotals([dummyItem2]);
    expect(res2.subtotalPaise).toBe(119700);
    expect(res2.shippingPaise).toBe(0);
    expect(res2.totalPaise).toBe(119700);
  });

  it('validates shipping address schema strictly', () => {
    const valid = {
      fullName: 'Vikram Mehta',
      email: 'vikram@example.com',
      phone: '9876543210',
      addressLine1: 'Plot 42, Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    };
    expect(ShippingAddressSchema.safeParse(valid).success).toBe(true);

    const invalidPhone = { ...valid, phone: '123' };
    expect(ShippingAddressSchema.safeParse(invalidPhone).success).toBe(false);

    const invalidPin = { ...valid, pincode: '12345' };
    expect(ShippingAddressSchema.safeParse(invalidPin).success).toBe(false);
  });

  it('validates customizer payload with bounded parameters', () => {
    const valid = {
      productId: 'prod-card-metal',
      businessName: 'The Luxe Boutique',
      finishId: 'metal-matte-black',
      quantity: 5,
      logoUrl: '',
    };
    expect(CustomizerSchema.safeParse(valid).success).toBe(true);

    const emptyName = { ...valid, businessName: 'A' };
    expect(CustomizerSchema.safeParse(emptyName).success).toBe(false);

    const excessQuantity = { ...valid, quantity: 1000 };
    expect(CustomizerSchema.safeParse(excessQuantity).success).toBe(false);
  });
});
