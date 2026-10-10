-- Copyright (c) 2026 QRslice. All rights reserved.
-- Migration: View-Only Menus (menus table with public read and owner-isolated write RLS).
-- Additive only, expand-before-contract.

CREATE TABLE IF NOT EXISTS public.menus (
  tenant_id UUID PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  categories JSONB NOT NULL DEFAULT '["All", "Mains", "Beverages", "Desserts"]'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  zomato_url TEXT,
  swiggy_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on public slug (/m/[slug])
CREATE UNIQUE INDEX IF NOT EXISTS uq_menus_slug ON public.menus(slug);

-- Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- 1. Public / Anonymous read access: guests can view digital menus
CREATE POLICY "public_menus_select" ON public.menus
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. Superadmins have full access
CREATE POLICY "superadmin_menus_all" ON public.menus
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

-- 3. Restaurant owners can update only their own restaurant's menu
CREATE POLICY "owner_menus_update" ON public.menus
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = menus.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = menus.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  );

-- 4. Restaurant owners can insert initial menu if not existing
CREATE POLICY "owner_menus_insert" ON public.menus
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = menus.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  );
