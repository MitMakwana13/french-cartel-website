import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isItemAvailableServerSide } from '@/lib/menu-availability';

// ── On-read daily reset ─────────────────────────────────────────────────────
async function resetDailyCountsIfNeeded(supabase: ReturnType<typeof createClient>) {
  const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  // Reset items whose daily_sold_reset_date is stale
  await supabase
    .from('menu_items')
    .update({ daily_sold_count: 0, daily_sold_reset_date: todayIST })
    .lt('daily_sold_reset_date', todayIST)
    .not('daily_limit', 'is', null); // only items with daily limits
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // Lazy daily reset
  await resetDailyCountsIfNeeded(supabase);

  let query = supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Annotate each item with server-side availability
  const annotated = (data || []).map((item) => {
    const availability = isItemAvailableServerSide(item);
    return { ...item, availability };
  });

  return NextResponse.json({ data: annotated });
}

export async function POST(request: Request) {
  const supabase = createClient();
  try {
    const body = await request.json();
    const { category } = body;
    if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 });

    const { data: maxSortData } = await supabase
      .from('menu_items')
      .select('sort_order')
      .eq('category', category)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSortData ? maxSortData.sort_order + 1 : 1;

    // Defaults for new items
    const defaults = {
      available_days: [0, 1, 2, 3, 4, 5, 6],
      stock_status: 'in_stock',
      daily_sold_count: 0,
      daily_sold_reset_date: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ ...defaults, ...body, sort_order: nextSortOrder }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // If stock_status changes, sync is_available
    if (updates.stock_status) {
      updates.is_available = updates.stock_status !== 'out_of_stock';
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
