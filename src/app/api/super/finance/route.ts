import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getFinanceLedger } from '@/lib/admin-finance-store';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const url = new URL(req.url);
  const period = (url.searchParams.get('period') as any) || 'all';
  const type = (url.searchParams.get('type') as any) || 'all';

  const data = await getFinanceLedger({ period, type });
  return NextResponse.json({ success: true, ...data });
}
