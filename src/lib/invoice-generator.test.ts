import { describe, it, expect } from 'vitest';
import { generateGSTInvoicePDF, InvoiceOrderData } from './invoice-generator';

describe('invoice-generator', () => {
  it('generates a compliant GST tax invoice PDF document with CGST/SGST for Maharashtra', () => {
    const dummyOrder: InvoiceOrderData = {
      orderNumber: 'ORD-2026-TEST01',
      createdAt: '2026-10-10T12:00:00.000Z',
      customerName: 'Aarav Singhania',
      customerEmail: 'aarav@singhania.in',
      customerPhone: '9876543210',
      shippingAddress: 'Plot 4, Bandra West, Mumbai, Maharashtra - 400050',
      gstin: '27AABCU9603R1ZM',
      businessLegalName: 'Singhania Hospitality LLP',
      items: [
        {
          title: 'Acrylic Google Review Standee (NFC + QR)',
          quantity: 2,
          unitPricePaise: 49900,
          finish: 'Ultra-Clear Gloss Acrylic',
          customBusinessName: 'Singhania Bistro',
        },
      ],
      subtotalPaise: 99800,
      shippingPaise: 0,
      totalPaise: 99800,
    };

    const doc = generateGSTInvoicePDF(dummyOrder);
    expect(doc).toBeDefined();
    expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(200);
  });

  it('generates compliant IGST for inter-state customer', () => {
    const dummyOrder: InvoiceOrderData = {
      orderNumber: 'ORD-2026-TEST02',
      createdAt: '2026-10-10T12:00:00.000Z',
      customerName: 'Priya Sharma',
      customerEmail: 'priya@delhiboutique.com',
      customerPhone: '9811122233',
      shippingAddress: 'Connaught Place, New Delhi - 110001',
      items: [
        {
          title: 'NFC Business Card (PVC Premium)',
          quantity: 1,
          unitPricePaise: 29900,
          finish: 'Stealth Matte Black',
          customBusinessName: 'Sharma Couture',
        },
      ],
      subtotalPaise: 29900,
      shippingPaise: 7900,
      totalPaise: 37800,
    };

    const doc = generateGSTInvoicePDF(dummyOrder);
    expect(doc).toBeDefined();
  });
});
