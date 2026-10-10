import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit-service';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const { searchParams } = new URL(req.url);
  const resourceType = searchParams.get('resourceType') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

  const { logs, total } = await getAuditLogs({ resourceType, limit, offset });
  return NextResponse.json({ logs, total });
}
