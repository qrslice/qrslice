import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { addStaffMember } from '@/lib/system-health-store';

export async function POST(req: NextRequest) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const body = await req.json();
    const res = await addStaffMember(body);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, member: res.member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
