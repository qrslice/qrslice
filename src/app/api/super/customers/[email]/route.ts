import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getAdminCustomerByEmail, addCustomerSupportNote } from '@/lib/admin-customer-store';

interface Props {
  params: Promise<{ email: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const { email } = await params;
  const decoded = decodeURIComponent(email);
  const customer = getAdminCustomerByEmail(decoded);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { email } = await params;
    const decoded = decodeURIComponent(email);
    const body = await req.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    const authorEmail = authRes.user?.email || 'admin@qrslice.com';
    const createdNote = await addCustomerSupportNote(decoded, note, authorEmail);
    return NextResponse.json({ note: createdNote, success: true });
  } catch (error) {
    console.error('Customer note error:', error);
    return NextResponse.json({ error: 'Failed to add customer note' }, { status: 500 });
  }
}
