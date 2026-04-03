import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StockStatus } from "@/lib/supabase/types";

interface StockUpdate {
  id: string;
  stock_status: StockStatus;
}

// PATCH /api/menu/stock
// Body: { updates: [{ id, stock_status, reset_daily_count }] }
export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  try {
    const { updates } = await req.json() as { updates: (StockUpdate & { reset_daily_count?: boolean })[] };
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Process each update
    const results = await Promise.all(
      updates.map(({ id, stock_status, reset_daily_count }) => {
        const payload: any = {};
        
        if (stock_status) {
          payload.stock_status = stock_status;
          payload.is_available = stock_status !== "out_of_stock";
        }

        if (reset_daily_count) {
          payload.daily_sold_count = 0;
          payload.daily_sold_reset_date = todayIST;
          // If we reset, and it was out_of_stock due to limit, bring it back
          if (!stock_status) {
             payload.stock_status = 'in_stock';
             payload.is_available = true;
          }
        }

        return supabase
          .from("menu_items")
          .update(payload)
          .eq("id", id)
          .select("id, name, stock_status, is_available, daily_sold_count")
          .single();
      })
    );

    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].error?.message }, { status: 500 });
    }

    return NextResponse.json({ data: results.map((r) => r.data) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/menu/stock — returns all items with their status + daily counts
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, category, emoji, stock_status, is_available, sort_order, daily_limit, daily_sold_count, daily_sold_reset_date")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Minimal on-read reset logic for stock panel too
  const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const normalizedData = data?.map(item => ({
    ...item,
    daily_sold_count: item.daily_sold_reset_date < todayIST ? 0 : (item.daily_sold_count || 0)
  }));

  return NextResponse.json({ data: normalizedData });
}
