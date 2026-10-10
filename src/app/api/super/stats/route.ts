import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getAdminDashboardStats } from '@/lib/admin-stats-service';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as any) || '30d';

  const stats = getAdminDashboardStats(period);
  return NextResponse.json(stats);
}
