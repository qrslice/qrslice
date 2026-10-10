import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { processOrderRefund } from '@/lib/orders-store';

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
    const { amountPaise, reason } = body;

    if (!amountPaise || !reason) {
      return NextResponse.json({ error: 'Refund amount and reason are required' }, { status: 400 });
    }

    const authorizedBy = authRes.user?.email || 'admin@qrslice.com';
    const res = await processOrderRefund(orderId, {
      amountPaise,
      reason,
      authorizedBy,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ order: res.order, success: true });
  } catch (error) {
    console.error('Process refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
