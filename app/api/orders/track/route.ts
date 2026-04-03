import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  const orderNumber = searchParams.get('order_number');

  if (!orderNumber || isNaN(Number(orderNumber))) {
    return NextResponse.json({ error: 'Invalid order number' }, { status: 400 });
  }

  // We only fetch and return completely sanitized data for public tracking
  const { data, error } = await supabase
    .from('orders')
    .select('order_number, status, estimated_ready_at, created_at')
    .eq('order_number', parseInt(orderNumber, 10))
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}
