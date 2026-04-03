import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // We use the regular client to enforce basic auth rules if needed, 
  // but for fetching all orders, standard RLS handles it.
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  const statusParam = searchParams.get('status');
  const dateParam = searchParams.get('date');
  const searchParam = searchParams.get('search');

  let query = supabase.from('orders').select('*');

  // Apply Status filter (can be comma-separated)
  if (statusParam) {
    const statuses = statusParam.split(',');
    query = query.in('status', statuses);
  }

  // Apply Search filter for name, phone, or order_number
  if (searchParam) {
    // To search order_number (integer), we have to handle it carefully. 
    // We'll search name/phone natively using ilike.
    query = query.or(`customer_name.ilike.%${searchParam}%,customer_phone.ilike.%${searchParam}%`);
  }

  // Date Filter - defaults to today across IST timezone boundaries.
  // Realistically, for an India-based store, we want to fetch orders from 5:30 AM to next 5:30 AM
  // But for simplicity, we will query the last 24-48 hours. The client will handle explicit tab filtering.
  if (dateParam) {
    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query.gte('created_at', startOfDay.toISOString());
    query = query.lte('created_at', endOfDay.toISOString());
  } else {
    // Default: Return orders from the last 24 hours to cover rolling operations.
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', last24h);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  // We use supabaseAdmin here optionally if complex transitions need to bypass RLS,
  // but standard RLS works.
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    let updatePayload: any = { status };

    // If order is newly accepted, calculate estimated_ready_at based on settings
    if (status === 'accepted') {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('estimated_wait_minutes')
        .eq('id', 1)
        .single();
        
      const waitMinutes = settings?.estimated_wait_minutes || 15;
      const readyAt = new Date(Date.now() + waitMinutes * 60000);
      updatePayload.estimated_ready_at = readyAt.toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { customer_name, customer_phone, items, instructions, total_price, payment_id } = body;

    if (!customer_name || !customer_phone || !total_price || !items) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_phone,
        items,
        instructions,
        total_price,
        payment_id,
        payment_status: payment_id ? 'paid' : 'pending',
        status: 'new'
      }])
      .select()
      .single();

    if (error) throw error;

    // ── Async: increment daily_sold_count for each item that has daily_limit ──
    // We don't await this so it doesn't block the checkout response.
    // Fire and forget — failure here won't break the order.
    (async () => {
      try {
        const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

        // Collect all item names to look up their menu_item IDs
        const itemNames: string[] = [
          items.size?.name,
          ...(items.addons || []).map((a: any) => a.name),
          ...(items.drinks || []).map((d: any) => d.name),
        ].filter(Boolean);

        if (itemNames.length === 0) return;

        // Fetch matching menu item IDs tracking daily limits
        const { data: menuItems } = await supabase
          .from('menu_items')
          .select('id')
          .in('name', itemNames)
          .not('daily_limit', 'is', null);
 
        if (!menuItems || menuItems.length === 0) return;
 
        // Simply INSERT into the sales log — the trigger handles the rest!
        const sales = menuItems.map(mi => ({ menu_item_id: mi.id }));
        await supabase.from('menu_item_sales').insert(sales);
      } catch (e) {
        console.error('[daily_sold_count] Background logging failed:', e);
      }
    })();

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
