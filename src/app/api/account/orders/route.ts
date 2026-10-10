import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getAccountOrders } from '@/lib/account-service';

export async function GET() {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const user = await currentUser();
    const primaryEmail = user?.emailAddresses?.[0]?.emailAddress;

    const orders = await getAccountOrders(session.userId, primaryEmail);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[GET /api/account/orders] Error:', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
