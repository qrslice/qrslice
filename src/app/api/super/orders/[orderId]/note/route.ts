import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { addOrderInternalNote } from '@/lib/orders-store';

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
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    const authorEmail = authRes.user?.email || 'admin@qrslice.com';
    const updated = await addOrderInternalNote(orderId, text, authorEmail);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: updated, success: true });
  } catch (error) {
    console.error('Add order note error:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
