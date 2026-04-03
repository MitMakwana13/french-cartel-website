import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;

  try {
    const body = await request.json();
    const {
      status,
      rejection_reason,
      rejection_category,
      cancelled_by = 'admin',
      auto_mark_out_of_stock,
      out_of_stock_item_id,
    } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    let updatePayload: any = { status };

    // Accepted → calculate ready time
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

    // Cancellation — attach rejection metadata
    if (status === 'cancelled') {
      updatePayload.cancelled_at = new Date().toISOString();
      updatePayload.cancelled_by = cancelled_by;
      if (rejection_reason) updatePayload.rejection_reason = rejection_reason;
      if (rejection_category) updatePayload.rejection_category = rejection_category;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Auto-mark item as out of stock if requested
    if (status === 'cancelled' && auto_mark_out_of_stock && out_of_stock_item_id) {
      await supabase
        .from('menu_items')
        .update({ stock_status: 'out_of_stock', is_available: false })
        .eq('id', out_of_stock_item_id);
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'admin',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, message: 'Order cancelled successfully' });
}
