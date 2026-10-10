-- Copyright (c) 2026 QRslice. All rights reserved.
-- Migration: 20261010000003_superadmin_phase2.sql
-- Additive tables for Phase 2: Café-Owner Subscriptions, QR Asset Registry, and Financial Reconciliation

-- 1. Merchant Subscriptions Table
create table if not exists public.super_subscriptions (
  id text primary key,
  tenant_id text not null,
  business_name text not null,
  owner_email text not null,
  owner_phone text,
  plan_id text not null default 'pro_monthly',
  status text not null default 'active', -- 'trialing', 'active', 'overdue', 'cancelled', 'expired', 'suspended'
  trial_ends_at timestamptz,
  current_period_end timestamptz not null,
  last_payment_id text,
  last_payment_amount_paise integer default 0,
  cancel_at_period_end boolean default false,
  cancellation_reason text,
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_super_sub_tenant on public.super_subscriptions(tenant_id);
create index if not exists idx_super_sub_status on public.super_subscriptions(status);

-- Enable RLS
alter table public.super_subscriptions enable row level security;

create policy "Super admin can view all subscriptions"
  on public.super_subscriptions for all
  using (true)
  with check (true);

-- 2. Financial Transaction Ledger (Reconciliation between Physical Sales and Subscriptions)
create table if not exists public.super_finance_transactions (
  id text primary key,
  transaction_type text not null, -- 'physical_order', 'subscription_renewal', 'refund'
  reference_id text not null,     -- order number or subscription id
  razorpay_payment_id text,
  razorpay_order_id text,
  gross_amount_paise integer not null,
  gst_paise integer default 0,
  fee_paise integer default 0,
  net_amount_paise integer not null,
  payment_method text default 'upi', -- 'upi', 'card', 'netbanking'
  status text not null default 'captured', -- 'captured', 'refunded', 'failed'
  customer_name text,
  customer_email text,
  created_at timestamptz default now()
);

create index if not exists idx_super_finance_ref on public.super_finance_transactions(reference_id);
create index if not exists idx_super_finance_type on public.super_finance_transactions(transaction_type);

-- Enable RLS
alter table public.super_finance_transactions enable row level security;

create policy "Super admin can manage finance ledger"
  on public.super_finance_transactions for all
  using (true)
  with check (true);
