import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminAuth } from '@/lib/auth';
import { getAdminProducts, createAdminProduct } from '@/lib/admin-catalog-store';

export async function GET(req: NextRequest) {
  const authRes = await verifySuperAdminAuth(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: authRes.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const status = (searchParams.get('status') as any) || undefined;

  const products = getAdminProducts({ search, category, status });
  return NextResponse.json({ products, total: products.length });
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await verifySuperAdminAuth(req);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const body = await req.json();
    if (!body.title || !body.slug || !body.basePricePaise) {
      return NextResponse.json({ error: 'Title, slug, and base price are required' }, { status: 400 });
    }

    const creatorEmail = authRes.user?.email || 'admin@qrslice.com';
    const created = await createAdminProduct(body, creatorEmail);
    return NextResponse.json({ product: created, success: true }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
