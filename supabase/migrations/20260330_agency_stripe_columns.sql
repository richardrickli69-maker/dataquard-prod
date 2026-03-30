-- Migration: Stripe-Spalten zu agency_accounts hinzufügen
-- Ausführen in: Supabase Dashboard → SQL Editor

ALTER TABLE public.agency_accounts
  ADD COLUMN IF NOT EXISTS stripe_customer_id        TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id    TEXT,
  ADD COLUMN IF NOT EXISTS current_period_end        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS doc_pack_stripe_item_id   TEXT;

-- Index für Webhook-Lookups per stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_agency_accounts_stripe_customer
  ON public.agency_accounts (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_agency_accounts_stripe_sub
  ON public.agency_accounts (stripe_subscription_id);
