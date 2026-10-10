-- Migration: 20261010000001_ecommerce_gst_claim_tokens.sql
-- Description: Additive migration adding GSTIN, Clerk User ID, subtotal, shipping, pre-routed URLs and printed claim tokens

-- 1. Extend shop_orders with B2B GSTIN and Clerk User ID
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS gstin TEXT;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS business_legal_name TEXT;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS subtotal_paise INTEGER DEFAULT 0;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS shipping_paise INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_shop_orders_clerk_user ON public.shop_orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_gstin ON public.shop_orders(gstin) WHERE gstin IS NOT NULL;

-- 2. Extend shop_order_items with hardware linkage & printed claim token
ALTER TABLE public.shop_order_items ADD COLUMN IF NOT EXISTS assigned_card_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.shop_order_items ADD COLUMN IF NOT EXISTS printed_claim_tokens JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.shop_order_items ADD COLUMN IF NOT EXISTS destination_url TEXT;

-- 3. Extend cards table with pre-routed checkout link metadata
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.shop_orders(id) ON DELETE SET NULL;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS printed_claim_token TEXT;

CREATE INDEX IF NOT EXISTS idx_cards_order_id ON public.cards(order_id) WHERE order_id IS NOT NULL;
