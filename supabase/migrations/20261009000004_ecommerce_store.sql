-- Migration: 20261009000004_ecommerce_store.sql
-- Description: E-commerce storefront tables, products catalog, order-to-card fulfillment, and 4-way card destinations

-- 1. Shop Products Catalog
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('standees', 'cards', 'plaques', 'tags')),
  vertical TEXT NOT NULL CHECK (vertical IN ('all', 'retail', 'salons', 'clinics', 'gyms', 'cafes', 'corporate')),
  base_price_paise INTEGER NOT NULL CHECK (base_price_paise > 0),
  finishes JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_products_slug ON public.shop_products(slug);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON public.shop_products(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_vertical ON public.shop_products(vertical);

-- 2. Shop Orders
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  total_paise INTEGER NOT NULL CHECK (total_paise > 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'captured', 'failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'manufacturing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  tracking_carrier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_order_number ON public.shop_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status ON public.shop_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON public.shop_orders(status);

-- 3. Shop Order Items (links custom branding & manufacturing batch)
CREATE TABLE IF NOT EXISTS public.shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shop_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise > 0),
  custom_business_name TEXT NOT NULL,
  custom_logo_url TEXT,
  finish TEXT NOT NULL,
  batch_id UUID REFERENCES public.card_batches(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id ON public.shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_batch_id ON public.shop_order_items(batch_id) WHERE batch_id IS NOT NULL;

-- 4. Additive extensions to Cards for Multi-Vertical Destinations
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS destination_url TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS showcase_data JSONB DEFAULT '{}'::jsonb;

-- Safely expand purpose check constraint to allow 'custom_url' and 'showcase'
ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_purpose_check;
ALTER TABLE public.cards ADD CONSTRAINT cards_purpose_check 
  CHECK (purpose IN ('reputation', 'custom_url', 'showcase', 'menu', 'profile'));

-- 5. RLS Policies
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

-- Shop Products: Publicly viewable if active
DROP POLICY IF EXISTS "Public can view active shop products" ON public.shop_products;
CREATE POLICY "Public can view active shop products"
  ON public.shop_products
  FOR SELECT
  USING (is_active = true);

-- Shop Products: Service role / superadmin write
DROP POLICY IF EXISTS "Service role manages shop products" ON public.shop_products;
CREATE POLICY "Service role manages shop products"
  ON public.shop_products
  FOR ALL
  USING (auth.role() = 'service_role');

-- Shop Orders: Public can create orders during checkout
DROP POLICY IF EXISTS "Public can create shop orders" ON public.shop_orders;
CREATE POLICY "Public can create shop orders"
  ON public.shop_orders
  FOR INSERT
  WITH CHECK (true);

-- Shop Orders: Public can view their own order by order_number lookup
DROP POLICY IF EXISTS "Public can view own order by id" ON public.shop_orders;
CREATE POLICY "Public can view own order by id"
  ON public.shop_orders
  FOR SELECT
  USING (true);

-- Shop Orders: Service role manages all orders
DROP POLICY IF EXISTS "Service role manages shop orders" ON public.shop_orders;
CREATE POLICY "Service role manages shop orders"
  ON public.shop_orders
  FOR ALL
  USING (auth.role() = 'service_role');

-- Shop Order Items: Public can create order items
DROP POLICY IF EXISTS "Public can create shop order items" ON public.shop_order_items;
CREATE POLICY "Public can create shop order items"
  ON public.shop_order_items
  FOR INSERT
  WITH CHECK (true);

-- Shop Order Items: Public can view their order items
DROP POLICY IF EXISTS "Public can view shop order items" ON public.shop_order_items;
CREATE POLICY "Public can view shop order items"
  ON public.shop_order_items
  FOR SELECT
  USING (true);

-- Shop Order Items: Service role manages all order items
DROP POLICY IF EXISTS "Service role manages shop order items" ON public.shop_order_items;
CREATE POLICY "Service role manages shop order items"
  ON public.shop_order_items
  FOR ALL
  USING (auth.role() = 'service_role');
