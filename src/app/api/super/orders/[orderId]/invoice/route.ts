import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { findOrderByNumber } from '@/lib/orders-store';
import { generateGSTInvoicePDF } from '@/lib/invoice-generator';

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { orderId } = await params;
    const order = await findOrderByNumber(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const doc = generateGSTInvoicePDF({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      gstin: order.gstin,
      businessLegalName: order.businessLegalName,
      items: order.items,
      subtotalPaise: order.subtotalPaise || order.totalPaise,
      shippingPaise: order.shippingPaise || 0,
      totalPaise: order.totalPaise,
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="qrslice-invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Invoice generation error:', err);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
