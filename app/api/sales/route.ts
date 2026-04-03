import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

// IST = UTC+5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function nowIST() {
  return new Date(Date.now() + IST_OFFSET_MS);
}

function startOfDayUTC(istDate: Date): string {
  const d = new Date(istDate);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - IST_OFFSET_MS).toISOString();
}

function endOfDayUTC(istDate: Date): string {
  const d = new Date(istDate);
  d.setUTCHours(23, 59, 59, 999);
  return new Date(d.getTime() - IST_OFFSET_MS).toISOString();
}

function getISTBounds(period: string, start?: string, end?: string) {
  const today = nowIST();

  if (period === "yesterday") {
    const yest = new Date(today);
    yest.setUTCDate(yest.getUTCDate() - 1);
    return { from: startOfDayUTC(yest), to: endOfDayUTC(yest) };
  }
  if (period === "week") {
    const weekAgo = new Date(today);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 6);
    return { from: startOfDayUTC(weekAgo), to: endOfDayUTC(today) };
  }
  if (period === "custom" && start && end) {
    return {
      from: new Date(start + "T00:00:00+05:30").toISOString(),
      to: new Date(end + "T23:59:59+05:30").toISOString(),
    };
  }
  // default: today
  return { from: startOfDayUTC(today), to: endOfDayUTC(today) };
}

function getYesterdayBounds() {
  const today = nowIST();
  const yest = new Date(today);
  yest.setUTCDate(yest.getUTCDate() - 1);
  return { from: startOfDayUTC(yest), to: endOfDayUTC(yest) };
}

function getLast7DaysBounds() {
  const today = nowIST();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - (6 - i));
    const label = day.toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" });
    return { label, from: startOfDayUTC(day), to: endOfDayUTC(day) };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "today";
  const customStart = searchParams.get("start") || undefined;
  const customEnd = searchParams.get("end") || undefined;

  const { from, to } = getISTBounds(period, customStart, customEnd);

  // All orders in period
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const allOrders: any[] = rawOrders || [];
  const activeOrders = allOrders.filter((o) => o.status !== "cancelled");
  const cancelledOrders = allOrders.filter((o) => o.status === "cancelled");
  const completedOrders = allOrders.filter((o) => o.status === "completed");

  const revenue = activeOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
  const orderCount = activeOrders.length;
  const cancelledCount = cancelledOrders.length;
  const avgOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Yesterday comparison
  const { from: yFrom, to: yTo } = getYesterdayBounds();
  const { data: yRaw } = await supabase
    .from("orders")
    .select("total_price, status")
    .gte("created_at", yFrom)
    .lte("created_at", yTo)
    .neq("status", "cancelled");
  const yOrders: any[] = yRaw || [];
  const yesterdayRevenue = yOrders.reduce((s: number, o: any) => s + (o.total_price || 0), 0);
  const yesterdayCount = yOrders.length;
  const yesterdayAOV = yesterdayCount > 0 ? Math.round(yesterdayRevenue / yesterdayCount) : 0;

  // JSONB aggregation
  const sizeCounts: Record<string, { count: number; revenue: number }> = {};
  const sauceCounts: Record<string, number> = {};
  const addonCounts: Record<string, { count: number; revenue: number }> = {};
  const hourCounts: Record<number, number> = {};

  for (const order of activeOrders) {
    const items = order.items || {};

    const sizeName: string = items.size?.name || "Unknown";
    if (!sizeCounts[sizeName]) sizeCounts[sizeName] = { count: 0, revenue: 0 };
    sizeCounts[sizeName].count++;
    sizeCounts[sizeName].revenue += items.size?.price || 0;

    const sauces: string[] = Array.isArray(items.sauces) ? items.sauces : [];
    for (const s of sauces) {
      sauceCounts[s] = (sauceCounts[s] || 0) + 1;
    }

    const addons: { name: string; price: number }[] = Array.isArray(items.addons) ? items.addons : [];
    for (const a of addons) {
      if (!addonCounts[a.name]) addonCounts[a.name] = { count: 0, revenue: 0 };
      addonCounts[a.name].count++;
      addonCounts[a.name].revenue += a.price || 0;
    }

    const createdAt = new Date(order.created_at);
    const hourIST = (createdAt.getUTCHours() + 5 + Math.floor((createdAt.getUTCMinutes() + 30) / 60)) % 24;
    hourCounts[hourIST] = (hourCounts[hourIST] || 0) + 1;
  }

  const sizeBreakdown = Object.entries(sizeCounts)
    .map(([name, d]) => ({ name, count: d.count, revenue: d.revenue }))
    .sort((a, b) => b.count - a.count);

  const totalOrders = sizeBreakdown.reduce((s, i) => s + i.count, 0);
  const sizeBreakdownWithPct = sizeBreakdown.map((s) => ({
    ...s,
    pct: totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0,
  }));

  const sauceBreakdown = Object.entries(sauceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const addonBreakdown = Object.entries(addonCounts)
    .map(([name, d]) => ({ name, count: d.count, revenue: d.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topSize = sizeBreakdown[0] || null;

  const hourlyOrders = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`,
    orders: hourCounts[h] || 0,
  }));
  const peakHour = hourlyOrders.reduce(
    (max, h) => (h.orders > max.orders ? h : max),
    { hour: -1, label: "", orders: 0 }
  );

  // Last 7 days revenue chart
  const days7 = getLast7DaysBounds();
  const dailyRevenue = await Promise.all(
    days7.map(async (day) => {
      const { data: dRaw } = await supabase
        .from("orders")
        .select("total_price, status")
        .gte("created_at", day.from)
        .lte("created_at", day.to)
        .neq("status", "cancelled");
      const dOrders: any[] = dRaw || [];
      const rev = dOrders.reduce((s: number, o: any) => s + (o.total_price || 0), 0);
      const cnt = dOrders.length;
      return { label: day.label, revenue: rev, orders: cnt };
    })
  );

  return NextResponse.json({
    revenue,
    orderCount,
    cancelledCount,
    completedCount: completedOrders.length,
    activeCount: activeOrders.filter((o) => !["completed", "cancelled"].includes(o.status)).length,
    avgOrderValue,
    yesterdayRevenue,
    yesterdayCount,
    yesterdayAOV,
    topSize,
    sizeBreakdown: sizeBreakdownWithPct,
    sauceBreakdown,
    addonBreakdown,
    hourlyOrders,
    peakHour: peakHour.orders > 0 ? peakHour : null,
    dailyRevenue,
  });
}
