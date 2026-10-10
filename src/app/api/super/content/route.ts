import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getContentSettings, updateContentSettings } from '@/lib/content-store';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const settings = await getContentSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const body = await req.json();
    const res = await updateContentSettings(body);
    return NextResponse.json({ success: true, settings: res.settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
