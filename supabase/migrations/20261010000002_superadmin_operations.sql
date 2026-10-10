-- Migration: 20261010000002_superadmin_operations.sql
-- Description: Additive tables & columns for QrSlice Super Admin Phase 1 operations:
-- Audit logs, inventory stock control, SKU, cost pricing, 7-stage order lifecycle, and refunds.

-- 1. Super Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.super_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL DEFAULT 'super_admin',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  changes_before JSONB DEFAULT '{}'::jsonb,
  changes_after JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.super_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.super_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.super_audit_logs(actor_id);

-- 2. Additive columns for shop_products (SKU, cost pricing, inventory stock, low-stock alerts)
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 50;
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS cost_price_paise INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 150;
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS fulfilment_days INTEGER DEFAULT 2;
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_shop_products_sku ON public.shop_products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shop_products_stock ON public.shop_products(stock_quantity);

-- 3. Additive columns for shop_orders (7-stage workflow, refunds, staff notes)
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS order_stage TEXT NOT NULL DEFAULT 'order_received'
  CHECK (order_stage IN (
    'order_received',
    'design_pending',
    'design_approved',
    'ready_to_print',
    'production',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));

ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS refunded_paise INTEGER DEFAULT 0;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS refund_authorized_by TEXT;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS packing_slip_generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_shop_orders_order_stage ON public.shop_orders(order_stage);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON public.shop_orders(created_at DESC);

-- 4. Customer Support Notes table
CREATE TABLE IF NOT EXISTS public.customer_support_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  author_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_notes_email ON public.customer_support_notes(customer_email);

-- 5. RLS Policies
ALTER TABLE public.super_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_support_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages audit logs" ON public.super_audit_logs;
CREATE POLICY "Service role manages audit logs"
  ON public.super_audit_logs
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages support notes" ON public.customer_support_notes;
CREATE POLICY "Service role manages support notes"
  ON public.customer_support_notes
  FOR ALL
  USING (auth.role() = 'service_role');
