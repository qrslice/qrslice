import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { updateOrderWorkflowStage } from '@/lib/orders-store';

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
    const { stage, note, trackingNumber, trackingCarrier, trackingUrl } = body;

    if (!stage) {
      return NextResponse.json({ error: 'Stage is required' }, { status: 400 });
    }

    const actorEmail = authRes.user?.email || 'admin@qrslice.com';
    const result = await updateOrderWorkflowStage(orderId, stage, note, actorEmail, {
      trackingNumber,
      trackingCarrier,
      trackingUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ order: result.order, success: true });
  } catch (error) {
    console.error('Update order stage error:', error);
    return NextResponse.json({ error: 'Failed to update order stage' }, { status: 500 });
  }
}
