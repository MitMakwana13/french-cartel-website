-- Quick Stock Control Migration
-- Run this in Supabase SQL Editor

ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock'
CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'));

-- Sync existing is_available = false items to out_of_stock
UPDATE public.menu_items
SET stock_status = 'out_of_stock'
WHERE is_available = false AND stock_status = 'in_stock';
