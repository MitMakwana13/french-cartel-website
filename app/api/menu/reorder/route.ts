import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { items } = body as { items: { id: string, sort_order: number }[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    // Supabase JS does not have an elegant upsert/bulk-update that only patches fields 
    // unless you provide the full primary key structure. Since we just want to update sort_order,
    // we can run a loop of promises if the payload is small (e.g. < 50 items).
    // For a food truck menu, categories have max ~15 items. A Promise.all is perfectly fine.
    
    const updatePromises = items.map((item) => 
      supabase
        .from('menu_items')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const error = results.find(r => r.error)?.error;
    if (error) throw error;

    return NextResponse.json({ message: 'Sort orders updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
