import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getAccountCards, updateCustomerCardDestination } from '@/lib/account-service';

export async function GET() {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const user = await currentUser();
    const primaryEmail = user?.emailAddresses?.[0]?.emailAddress;

    const cards = await getAccountCards(session.userId, primaryEmail);
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('[GET /api/account/cards] Error:', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const { cardId, purpose, destinationUrl } = body;

    if (!cardId || !purpose) {
      return NextResponse.json({ error: 'Missing cardId or purpose' }, { status: 400 });
    }

    const result = await updateCustomerCardDestination(cardId, purpose, destinationUrl);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, card: result.card });
  } catch (error) {
    console.error('[PATCH /api/account/cards] Error:', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
