import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: { phone: string } }
) {
  const phone = decodeURIComponent(params.phone);

  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders: any[] = rawOrders || [];
  const activeOrders = orders.filter((o) => o.status !== "cancelled");

  // Preference analysis
  const sizeCounts: Record<string, number> = {};
  const sauceCounts: Record<string, number> = {};
  const addonCounts: Record<string, number> = {};
  const dayCount: Record<number, number> = {};

  for (const order of activeOrders) {
    const items = order.items || {};

    if (items.size?.name) {
      sizeCounts[items.size.name] = (sizeCounts[items.size.name] || 0) + 1;
    }
    for (const s of (items.sauces || []) as string[]) {
      sauceCounts[s] = (sauceCounts[s] || 0) + 1;
    }
    for (const a of (items.addons || []) as { name: string }[]) {
      addonCounts[a.name] = (addonCounts[a.name] || 0) + 1;
    }

    const day = new Date(order.created_at).getDay(); // 0=Sun
    dayCount[day] = (dayCount[day] || 0) + 1;
  }

  const topSize = Object.entries(sizeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
  const topSauces = Object.entries(sauceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name);
  const topAddon = Object.entries(addonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const topDays = Object.entries(dayCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([d]) => dayNames[parseInt(d)]);

  const totalSpent = activeOrders.reduce((s, o) => s + (o.total_price || 0), 0);
  const avgOrder = activeOrders.length > 0 ? Math.round(totalSpent / activeOrders.length) : 0;

  let preferenceSummary = "";
  if (topSize) preferenceSummary += `Usually orders ${topSize}`;
  if (topSauces.length) preferenceSummary += ` with ${topSauces.join(" + ")}`;
  if (topAddon) preferenceSummary += `, always adds ${topAddon}`;

  return NextResponse.json({
    orders,
    stats: {
      totalOrders: activeOrders.length,
      cancelledCount: orders.length - activeOrders.length,
      totalSpent,
      avgOrder,
    },
    preferences: {
      topSize,
      topSauces,
      topAddon,
      topDays,
      preferenceSummary,
    },
  });
}
