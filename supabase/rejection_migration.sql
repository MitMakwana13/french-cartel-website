-- Rejection Flow Migration
-- Run in Supabase SQL Editor

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_category TEXT
    CHECK (rejection_category IN ('out_of_stock', 'closing_soon', 'too_busy', 'item_unavailable', 'other')),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT DEFAULT 'admin'
    CHECK (cancelled_by IN ('admin', 'system', 'customer'));
