import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = supabase.from('menu_items').select('*').order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { category } = body;

    if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 });

    // Find the max sort_order for this category
    const { data: maxSortData } = await supabase
      .from('menu_items')
      .select('sort_order')
      .eq('category', category)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSortData ? maxSortData.sort_order + 1 : 1;

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ ...body, sort_order: nextSortOrder }])
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

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
