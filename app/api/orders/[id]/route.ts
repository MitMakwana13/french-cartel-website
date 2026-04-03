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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    let updatePayload: any = { status };

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;

  // Soft delete: set status to cancelled
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, message: 'Order cancelled successfully' });
}
