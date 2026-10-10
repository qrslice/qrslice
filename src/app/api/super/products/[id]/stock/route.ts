import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { adjustProductStock } from '@/lib/admin-catalog-store';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { id } = await params;
    const body = await req.json();
    const { delta, reason, notes } = body;

    if (typeof delta !== 'number' || !reason) {
      return NextResponse.json({ error: 'Delta quantity and reason are required' }, { status: 400 });
    }

    const actorEmail = authRes.user?.email || 'admin@qrslice.com';
    const updated = await adjustProductStock(id, { delta, reason, notes }, actorEmail);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: updated, success: true });
  } catch (error) {
    console.error('Stock adjust error:', error);
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
}
