export type MenuCategory = 'size' | 'sauce' | 'seasoning' | 'addon' | 'drink';
export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface MenuItem {
  id: string;
  category: MenuCategory;
  name: string;
  code: string | null;
  label: string | null;
  price: number;
  emoji: string | null;
  description: string | null;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
  max_selection: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  size: { name: string; code: string; price: number };
  sauces: string[];
  seasonings: string[];
  addons: { name: string; price: number; emoji?: string }[];
  drinks: { name: string; price: number; emoji?: string }[];
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  items: OrderItem;
  instructions: string | null;
  total_price: number;
  payment_id: string | null;
  payment_status: string;
  estimated_ready_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  estimated_wait_minutes: number;
  max_active_orders: number;
  announcement: string | null;
  closed_reason: string | null;
  whatsapp_number: string;
  auto_close_at_close_time: boolean;
  updated_at: string;
}

export interface OperatingHours {
  id: number;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}
