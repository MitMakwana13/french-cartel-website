-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing tables to apply the new schema cleanly
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;
DROP TABLE IF EXISTS public.operating_hours CASCADE;
-- Note: Re-creating orders table as well to ensure it has the new order_number identity column
DROP TABLE IF EXISTS public.orders CASCADE;

-- 1. menu_items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT CHECK (category IN ('size', 'sauce', 'seasoning', 'addon', 'drink')),
    name TEXT NOT NULL,
    code TEXT,
    label TEXT,
    price INTEGER DEFAULT 0,
    emoji TEXT,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1001),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
    items JSONB NOT NULL,
    instructions TEXT,
    total_price INTEGER NOT NULL,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'paid',
    estimated_ready_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. store_settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    is_open BOOLEAN DEFAULT true,
    open_time TIME DEFAULT '16:00',
    close_time TIME DEFAULT '23:00',
    estimated_wait_minutes INTEGER DEFAULT 15,
    max_active_orders INTEGER DEFAULT 20,
    announcement TEXT,
    closed_reason TEXT,
    whatsapp_number TEXT DEFAULT '919924247897',
    auto_close_at_close_time BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. operating_hours
CREATE TABLE IF NOT EXISTS public.operating_hours (
    id INTEGER PRIMARY KEY CHECK (id >= 0 AND id <= 6),
    day_name TEXT NOT NULL,
    is_open BOOLEAN DEFAULT true,
    open_time TIME DEFAULT '16:00',
    close_time TIME DEFAULT '23:00'
);

-- Realtime for orders
-- Enable Realtime by adding the table to the `supabase_realtime` publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- menu_items
CREATE POLICY "menu_items_select_all" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_auth" ON public.menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menu_items_update_auth" ON public.menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "menu_items_delete_auth" ON public.menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- orders
CREATE POLICY "orders_insert_all" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_select_auth" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orders_update_auth" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

-- store_settings
CREATE POLICY "store_settings_select_all" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "store_settings_update_auth" ON public.store_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- operating_hours
CREATE POLICY "operating_hours_select_all" ON public.operating_hours FOR SELECT USING (true);
CREATE POLICY "operating_hours_update_auth" ON public.operating_hours FOR UPDATE USING (auth.role() = 'authenticated');


-- Seed Data

-- Sizes
INSERT INTO public.menu_items (category, name, code, label, price, description, is_popular, sort_order) VALUES
('size', 'Bite', 'B', 'Extra Small', 109, 'Perfect snack', false, 1),
('size', 'Kilobite', 'KB', 'Small', 169, 'Light hungry', false, 2),
('size', 'MegaBite', 'MB', 'Medium', 229, 'Good choice', true, 3),
('size', 'GigaBite', 'GB', 'Large', 289, 'Go big or go home', false, 4);

-- Sauces
INSERT INTO public.menu_items (category, name, sort_order) VALUES
('sauce', 'Rich & Creamy', 1),
('sauce', 'Tandoori', 2),
('sauce', 'Spicy Garlic', 3),
('sauce', 'Korean BBQ', 4),
('sauce', 'Cheesy Spread', 5),
('sauce', 'Chipotle', 6),
('sauce', 'Tomato Ketchup', 7),
('sauce', 'Cheese & Jalapeño', 8),
('sauce', 'Spicy Momo', 9),
('sauce', 'Peri Peri', 10);

-- Seasonings
INSERT INTO public.menu_items (category, name, sort_order) VALUES
('seasoning', 'All Purpose', 1),
('seasoning', 'Pizza Pasta', 2),
('seasoning', 'Garlic Powder', 3),
('seasoning', 'Herby Italian', 4),
('seasoning', 'Taco', 5),
('seasoning', 'Cajun Spice', 6),
('seasoning', 'Cheese & Herb', 7),
('seasoning', 'Lemon Pepper', 8),
('seasoning', 'Garlic Bread', 9),
('seasoning', 'Onion Powder', 10);

-- Add-ons
INSERT INTO public.menu_items (category, name, price, emoji, sort_order) VALUES
('addon', 'Extra Cheese', 30, '🧀', 1),
('addon', 'Nachos', 20, '🫔', 2),
('addon', 'Kurkure', 15, '🍿', 3);

-- Drinks
INSERT INTO public.menu_items (category, name, price, emoji, sort_order) VALUES
('drink', 'Diet Coke', 40, '🥤', 1),
('drink', 'Thumbs Up', 20, '🫙', 2),
('drink', 'Maaza', 20, '🥭', 3),
('drink', 'Water', 10, '💧', 4);

-- Operating Hours
INSERT INTO public.operating_hours (id, day_name, is_open, open_time, close_time) VALUES
(0, 'Sunday', true, '16:00', '22:00'),
(1, 'Monday', true, '16:00', '23:00'),
(2, 'Tuesday', true, '16:00', '23:00'),
(3, 'Wednesday', true, '16:00', '23:00'),
(4, 'Thursday', true, '16:00', '23:00'),
(5, 'Friday', true, '16:00', '23:00'),
(6, 'Saturday', true, '16:00', '23:00');

-- Store Settings
INSERT INTO public.store_settings (id, is_open, estimated_wait_minutes, max_active_orders, open_time, close_time, auto_close_at_close_time) VALUES
(1, true, 15, 20, '16:00', '23:00', false);
