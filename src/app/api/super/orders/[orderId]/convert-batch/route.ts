import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { MOCK_ADMIN_ORDERS } from '@/lib/orders-store';
import { createBatch, generateBatchCards } from '@/lib/card-store';

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { orderId } = await params;
    const order = MOCK_ADMIN_ORDERS.find((o) => o.id === orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const firstItem = order.items[0];
    const qty = firstItem ? firstItem.quantity : 1;
    const businessName = firstItem ? firstItem.customBusinessName : order.customerName;

    // Create batch
    const batch = await createBatch({
      name: `${businessName} (${order.orderNumber})`,
      quantity: qty,
      design: {
        businessName,
      },
    });

    // Generate cryptographic cards and PINs
    const { reveals } = await generateBatchCards(batch.id, qty);

    if (firstItem) {
      firstItem.batchId = batch.id;
    }
    order.status = 'manufacturing';

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      cardCount: reveals.length,
    });
  } catch (error) {
    console.error('Convert batch error:', error);
    return NextResponse.json({ error: 'Failed to convert order to batch' }, { status: 500 });
  }
}
