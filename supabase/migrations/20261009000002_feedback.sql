-- Copyright (c) 2026 QRslice. All rights reserved.
-- Migration: Guest Feedback (private feedback table with tenant-isolated RLS).
-- Additive only, expand-before-contract.

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  card_id TEXT REFERENCES public.cards(card_id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_tenant_created
  ON public.feedback(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_tenant_rating
  ON public.feedback(tenant_id, rating);

CREATE INDEX IF NOT EXISTS idx_feedback_tenant_status
  ON public.feedback(tenant_id, status);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Superadmins full access
CREATE POLICY "superadmin_feedback_all" ON public.feedback
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

-- Restaurant owners can read only their restaurant's feedback
CREATE POLICY "owner_feedback_select" ON public.feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = feedback.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  );

-- Restaurant owners can update feedback status (e.g., mark resolved)
CREATE POLICY "owner_feedback_update" ON public.feedback
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = feedback.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.restaurant_id = feedback.tenant_id
        AND users.role IN ('owner', 'admin')
    )
  );

-- Guests submit feedback through the server API route (/api/feedback/submit).
-- Direct client anonymous SELECT access is explicitly prohibited to preserve privacy.
