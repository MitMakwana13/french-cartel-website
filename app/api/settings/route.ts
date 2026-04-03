import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentISTDayIndex } from '@/lib/utils/time';

export async function GET(request: Request) {
  const supabase = createClient();
  
  // Fetch master singleton settings
  const { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });
  
  // Fetch today's localized exact hours
  const todayIndex = getCurrentISTDayIndex();
  const { data: todayHours, error: hoursError } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('id', todayIndex)
    .single();

  if (hoursError) return NextResponse.json({ error: hoursError.message }, { status: 500 });

  return NextResponse.json({ store_settings: settings, today_hours: todayHours });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    
    // Partial updates allowed. E.g. { is_open: false, closed_reason: "Rain" }
    const { data, error } = await supabase
      .from('store_settings')
      .update(body)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ store_settings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
