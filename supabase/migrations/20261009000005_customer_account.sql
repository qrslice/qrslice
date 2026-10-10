-- Migration: 20261009000005_customer_account.sql
-- Description: Customer account integration with Clerk User ID for shop orders and claimed cards

-- 1. Add Clerk User ID to shop_orders
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_shop_orders_clerk_user_id ON public.shop_orders(clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shop_orders_customer_email ON public.shop_orders(customer_email);

-- 2. Add Clerk User ID to cards for personal/merchant hardware fleet
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_cards_clerk_user_id ON public.cards(clerk_user_id) WHERE clerk_user_id IS NOT NULL;

-- 3. RLS policy to allow users to select their orders matching clerk_user_id
-- (In local dev / edge server, service role or API endpoints handle authenticated reads safely)
