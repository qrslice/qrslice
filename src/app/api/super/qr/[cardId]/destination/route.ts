import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { updateQRDestination } from '@/lib/admin-qr-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { cardId } = await params;
    const body = await req.json();
    const { newDestination, upiId } = body;

    if (!newDestination || typeof newDestination !== 'string') {
      return NextResponse.json({ error: 'Valid destination URL is required' }, { status: 400 });
    }

    const res = await updateQRDestination(cardId, newDestination, upiId);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, asset: res.asset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
