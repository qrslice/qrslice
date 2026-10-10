import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { updateStaffMember } from '@/lib/system-health-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { id } = await params;
    const body = await req.json();
    const res = await updateStaffMember(id, body);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, member: res.member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
