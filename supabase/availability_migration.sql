-- Advanced Availability & Stock Status Migration
-- Combined Mission 11 & 12
-- Run in Supabase SQL Editor

-- 1. Stock Status (Mission 11)
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock'
  CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'));

-- 2. Scheduled availability (Mission 12)
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS available_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}';
-- 0=Sunday, 1=Monday ... 6=Saturday

-- 3. Time-based availability
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS available_from TIME,
  ADD COLUMN IF NOT EXISTS available_until TIME;

-- 4. Customer-facing label badge
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS customer_label TEXT;

-- 5. Daily quantity limit
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS daily_limit INTEGER;

-- 6. Track daily sold count
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS daily_sold_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_sold_reset_date DATE DEFAULT CURRENT_DATE;

-- Backfill: set reset date to today for all existing items
UPDATE public.menu_items
SET daily_sold_reset_date = CURRENT_DATE
WHERE daily_sold_reset_date IS NULL;

-- 7. Sales Tracking Table (For Anon Insert Tracking)
-- This allows anyone (customers) to log a sale without having update permissions on menu_items
CREATE TABLE IF NOT EXISTS public.menu_item_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for sales log
ALTER TABLE public.menu_item_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "menu_item_sales_insert_anon" ON public.menu_item_sales;
CREATE POLICY "menu_item_sales_insert_anon" ON public.menu_item_sales FOR INSERT WITH CHECK (true);

-- 8. Trigger to automatically increment daily_sold_count on sale
CREATE OR REPLACE FUNCTION public.handle_menu_item_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Increment the count. If reset_date is old, reset it to 1
    UPDATE public.menu_items
    SET 
        daily_sold_count = CASE 
            WHEN daily_sold_reset_date < v_today OR daily_sold_reset_date IS NULL THEN 1 
            ELSE daily_sold_count + 1 
        END,
        daily_sold_reset_date = v_today,
        -- Auto-set out_of_stock if limit reached
        stock_status = CASE
            WHEN daily_limit IS NOT NULL AND (
                CASE WHEN daily_sold_reset_date < v_today THEN 1 ELSE daily_sold_count + 1 END
            ) >= daily_limit THEN 'out_of_stock'
            ELSE stock_status
        END,
        is_available = CASE
            WHEN daily_limit IS NOT NULL AND (
                CASE WHEN daily_sold_reset_date < v_today THEN 1 ELSE daily_sold_count + 1 END
            ) >= daily_limit THEN false
            ELSE is_available
        END
    WHERE id = NEW.menu_item_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_menu_item_sale ON public.menu_item_sales;
CREATE TRIGGER on_menu_item_sale
AFTER INSERT ON public.menu_item_sales
FOR EACH ROW EXECUTE FUNCTION public.handle_menu_item_sale();

-- 9. Cleanup RLS on menu_items
DROP POLICY IF EXISTS "menu_items_update_auth" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_admin_update" ON public.menu_items;
CREATE POLICY "menu_items_admin_update" ON public.menu_items 
  FOR UPDATE USING (auth.role() = 'authenticated');
