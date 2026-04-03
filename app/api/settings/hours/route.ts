import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OperatingHours } from '@/lib/supabase/types';

export async function GET(request: Request) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('operating_hours')
    .select('*')
    .order('id', { ascending: true }); // Important to keep Week sequence aligned

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ operating_hours: data });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const hoursArray = body.hours as Partial<OperatingHours>[];

    if (!Array.isArray(hoursArray)) {
      return NextResponse.json({ error: 'Malformed request matrix' }, { status: 400 });
    }

    // Since it's exactly 7 records representing M-Su, we update them concurrently
    const promises = hoursArray.map(hourSet => {
      // id is required to path properly
      if (typeof hourSet.id === 'number') {
         return supabase
          .from('operating_hours')
          .update({
            is_open: hourSet.is_open,
            open_time: hourSet.open_time,
            close_time: hourSet.close_time
          })
          .eq('id', hourSet.id)
      }
      return Promise.resolve(null);
    });

    const results = await Promise.all(promises);
    const hasError = results.some(r => r && r.error);

    if (hasError) throw new Error("Bulk updating operations encountered partial failure");

    return NextResponse.json({ message: "Schedule committed flawlessly." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
