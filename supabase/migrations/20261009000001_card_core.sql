-- Copyright (c) 2026 QRslice. All rights reserved.
-- Migration: Card Core (card_batches, cards, indexes, and RLS policies).
-- Additive only, expand-before-contract.

-- 1. card_batches: physical card production batches
CREATE TABLE IF NOT EXISTS public.card_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'premium-plum'
    CHECK (theme IN ('premium-plum', 'google-review', 'minimal-mono')),
  design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0 AND quantity <= 500),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'exported', 'manufactured')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_card_batches_status ON public.card_batches(status);
CREATE INDEX IF NOT EXISTS idx_card_batches_created_at ON public.card_batches(created_at DESC);

-- 2. cards: individual physical NFC + QR cards
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.card_batches(id) ON DELETE RESTRICT,
  card_id TEXT NOT NULL,
  claim_pin_hash TEXT NOT NULL,
  activation_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'manufactured'
    CHECK (status IN ('manufactured', 'in_stock', 'assigned', 'claimed', 'active', 'disabled')),
  tenant_id UUID REFERENCES public.restaurants(id),
  purpose TEXT DEFAULT 'reputation'
    CHECK (purpose IN ('menu', 'reputation', 'profile')),
  svg_front TEXT,
  svg_back TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on public card ID (QS-XXXXXXX)
CREATE UNIQUE INDEX IF NOT EXISTS uq_cards_card_id ON public.cards(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_batch_id ON public.cards(batch_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_tenant_id ON public.cards(tenant_id) WHERE tenant_id IS NOT NULL;

-- Trigger to maintain updated_at on cards
CREATE OR REPLACE FUNCTION public.cards_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cards_updated_at ON public.cards;
CREATE TRIGGER trg_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.cards_touch_updated_at();

-- 3. Row Level Security (RLS)
ALTER TABLE public.card_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Superadmins have full access
CREATE POLICY "superadmin_card_batches_all" ON public.card_batches
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

CREATE POLICY "superadmin_cards_all" ON public.cards
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

-- Restaurant owners can read only cards bound to their restaurant
CREATE POLICY "owner_cards_select" ON public.cards
  FOR SELECT TO authenticated
  USING (
    tenant_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = cards.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  );

-- Restaurant owners can update purpose / rename for active cards bound to their restaurant
CREATE POLICY "owner_cards_update" ON public.cards
  FOR UPDATE TO authenticated
  USING (
    tenant_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = cards.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    tenant_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = cards.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  );

-- Public / Anonymous direct table reads are explicitly DISALLOWED.
-- All guest/public reads must flow through the rate-limited server resolve path (/a/[cardId]).
