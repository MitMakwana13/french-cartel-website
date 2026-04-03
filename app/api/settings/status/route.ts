import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentISTDayIndex, isCurrentISTWithinHours } from '@/lib/utils/time';

// Important: NextJS caches GET requests heavily by default. 
// We export this constraint to guarantee the route is dynamically re-evaluated every time it's hit.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Use createClient without worrying about RLS because the tables are configured for public SELECT
  const supabase = createClient();
  
  try {
    const { data: settings, error: sErr } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (sErr || !settings) throw new Error("Failed fetching defaults");

    const todayIndex = getCurrentISTDayIndex();
    
    const { data: todayHours, error: hErr } = await supabase
      .from('operating_hours')
      .select('*')
      .eq('id', todayIndex)
      .single();

    if (hErr || !todayHours) throw new Error("Failed fetching today schedules");

    // We must evaluate 3 distinct factors exactly in this order:
    // 1. Is the master switch manually thrown?
    // 2. Is today toggled ON historically?
    // 3. Are we currently inside the localized execution hours?
    let finalIsOpen = true;

    // Trigger physical auto-close DB mutation if active and time is out of bounds
    if (settings.auto_close_at_close_time && settings.is_open) {
       if (!isCurrentISTWithinHours(todayHours.open_time, todayHours.close_time)) {
           try {
              await supabaseAdmin.from('store_settings').update({ is_open: false, closed_reason: "Auto-closed" }).eq('id', 1);
              settings.is_open = false; // Set local payload memory to false immediately
              settings.closed_reason = "Auto-closed";
           } catch(e) {}
       }
    }

    if (!settings.is_open) {
       finalIsOpen = false;
    } else if (!todayHours.is_open) {
       finalIsOpen = false;
    } else if (!isCurrentISTWithinHours(todayHours.open_time, todayHours.close_time)) {
       finalIsOpen = false;
    }

    // BONUS CHECK: Max Active Orders Threshold Verification
    if (finalIsOpen && settings.max_active_orders > 0) {
       // Query count of active physical operations remaining
       const { count, error: cErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'accepted', 'preparing']);

       if (!cErr && count !== null) {
          if (count >= settings.max_active_orders) {
             finalIsOpen = false;
             // Temporarily spoof the Closed Reason strictly for this response payload
             settings.closed_reason = "Experiencing extraordinarily high volume! Queue is temporally paused. Please refresh in a few minutes.";
          }
       }
    }

    return NextResponse.json({
      is_open: finalIsOpen,
      estimated_wait_minutes: settings.estimated_wait_minutes,
      announcement: settings.announcement,
      closed_reason: settings.closed_reason, // This might be temporarily overwritten by volumetric protections above
      today_hours: todayHours
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
