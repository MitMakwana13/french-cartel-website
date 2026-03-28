-- French Cartel Database Schema

-- 1. Create Tables
CREATE TABLE menu_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_sold_out BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending_payment', -- pending_payment, new, accepted, ready, done
    total_amount NUMERIC(10, 2) NOT NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    special_instructions TEXT,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- 2. Configure Realtime
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;
  -- re-create the supabase_realtime publication with no tables
  create publication supabase_realtime;
commit;

-- add tables to the publication
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table menu_items;

-- 3. Row Level Security
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies (For this MVP, we allow open reads on menu and open inserts/reads on orders via anon key since no user auth is strictly required for ordering)
CREATE POLICY "Public Read Access to menu_categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Access to menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Access to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Update Access to orders" ON orders FOR UPDATE USING (true); -- For webhook/admin updates
CREATE POLICY "Public Insert Access to order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Access to order_items" ON order_items FOR SELECT USING (true);

-- 4. Initial Seed Data
INSERT INTO menu_categories (name, sort_order) VALUES
('Loaded Fries', 1),
('Drinks', 2),
('Extras', 3);

-- Assuming IDs for categories will be generated, you can use the Supabase Dashboard to insert menu items later.
