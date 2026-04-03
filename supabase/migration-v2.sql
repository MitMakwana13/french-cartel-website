-- French Cartel Platform: Migration V2 (Missions 9-13)
-- Consolidates Stock Status, Advanced Availability, and Order Rejection Flow.

-- 1. Orders: Rejection & Cancellation (Mission 13)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_category TEXT
    CHECK (rejection_category IN ('out_of_stock', 'closing_soon', 'too_busy', 'item_unavailable', 'other')),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT DEFAULT 'admin'
    CHECK (cancelled_by IN ('admin', 'system', 'customer'));

-- 2. Menu Items: Stock Status (Mission 11)
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock'
  CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'));

-- 3. Menu Items: Advanced Availability (Mission 12)
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS available_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}';

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS available_from TIME,
  ADD COLUMN IF NOT EXISTS available_until TIME;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS customer_label TEXT;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS daily_limit INTEGER;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS daily_sold_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_sold_reset_date DATE DEFAULT CURRENT_DATE;

-- Backfill reset date
UPDATE public.menu_items SET daily_sold_reset_date = CURRENT_DATE WHERE daily_sold_reset_date IS NULL;

-- 4. Sales Tracking: Analytics Engine
CREATE TABLE IF NOT EXISTS public.menu_item_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for sales tracking
ALTER TABLE public.menu_item_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "menu_item_sales_insert_anon" ON public.menu_item_sales;
CREATE POLICY "menu_item_sales_insert_anon" ON public.menu_item_sales FOR INSERT WITH CHECK (true);

-- 5. Trigger: Automated Stock Management
CREATE OR REPLACE FUNCTION public.handle_menu_item_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
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

-- 6. RLS: Administrative Cleanup
DROP POLICY IF EXISTS "menu_items_update_auth" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_admin_update" ON public.menu_items;
CREATE POLICY "menu_items_admin_update" ON public.menu_items 
  FOR UPDATE USING (auth.role() = 'authenticated');
