import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { MOCK_ADMIN_ORDERS, filterOrdersByDate } from '@/lib/orders-store';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as any) || undefined;
  const stage = searchParams.get('stage') || undefined;
  const search = searchParams.get('search')?.toLowerCase().trim() || undefined;

  let orders = filterOrdersByDate(MOCK_ADMIN_ORDERS, period);

  if (stage && stage !== 'all') {
    orders = orders.filter((o) => o.orderStage === stage || o.status === stage);
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerEmail.toLowerCase().includes(search) ||
        o.customerPhone.includes(search) ||
        o.items.some((i) => i.customBusinessName.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ orders, total: orders.length });
}
