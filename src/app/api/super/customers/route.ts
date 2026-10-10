import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getAdminCustomers } from '@/lib/admin-customer-store';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;

  const customers = getAdminCustomers({ search });
  return NextResponse.json({ customers, total: customers.length });
}
