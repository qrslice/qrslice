import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { listQRAssets } from '@/lib/admin-qr-store';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const url = new URL(req.url);
  const purpose = url.searchParams.get('purpose') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const search = url.searchParams.get('search') || undefined;

  const assets = await listQRAssets({ purpose, status, search });
  return NextResponse.json({ success: true, assets });
}
