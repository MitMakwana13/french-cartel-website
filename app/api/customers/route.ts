import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "orders";
  const tier = searchParams.get("tier") || "all";
  const search = searchParams.get("search") || "";
  const activity = searchParams.get("activity") || "all";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Fetch all non-test orders
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select("customer_name, customer_phone, total_price, status, items, created_at, order_number")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders: any[] = rawOrders || [];

  // Activity filter bounds
  const now = Date.now();
  const activity7 = now - 7 * 24 * 60 * 60 * 1000;
  const activity30 = now - 30 * 24 * 60 * 60 * 1000;

  // Aggregate by phone
  const phoneMap: Record<string, any> = {};

  for (const order of orders) {
    const phone = order.customer_phone;
    if (!phone) continue;

    if (!phoneMap[phone]) {
      phoneMap[phone] = {
        phone,
        names: [],
        orders: [],
        cancelledOrders: [],
        totalSpent: 0,
        lastOrderAt: null,
        sizeCounts: {} as Record<string, number>,
      };
    }

    const c = phoneMap[phone];
    c.names.push(order.customer_name);

    const orderDate = new Date(order.created_at).getTime();
    if (!c.lastOrderAt || orderDate > new Date(c.lastOrderAt).getTime()) {
      c.lastOrderAt = order.created_at;
    }

    if (order.status === "cancelled") {
      c.cancelledOrders.push(order);
    } else {
      c.orders.push(order);
      c.totalSpent += order.total_price || 0;

      // Size tracking
      const sizeName = order.items?.size?.name;
      if (sizeName) {
        c.sizeCounts[sizeName] = (c.sizeCounts[sizeName] || 0) + 1;
      }
    }
  }

  // Shape customer objects
  let customers = Object.values(phoneMap).map((c: any) => {
    const orderCount = c.orders.length;
    const tier =
      orderCount >= 20 ? "diamond"
      : orderCount >= 10 ? "gold"
      : orderCount >= 5 ? "silver"
      : "bronze";

    const favSize = Object.entries(c.sizeCounts as Record<string, number>)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Most recent name
    const name = c.names[0] || "Unknown";

    // Most recent order preview
    const latestOrder = c.orders[0] || null;

    return {
      phone: c.phone,
      name,
      orderCount,
      cancelledCount: c.cancelledOrders.length,
      totalSpent: c.totalSpent,
      avgOrder: orderCount > 0 ? Math.round(c.totalSpent / orderCount) : 0,
      lastOrderAt: c.lastOrderAt,
      favSize,
      tier,
      latestOrder: latestOrder
        ? {
            order_number: latestOrder.order_number,
            status: latestOrder.status,
            total_price: latestOrder.total_price,
            created_at: latestOrder.created_at,
            items: latestOrder.items,
          }
        : null,
    };
  });

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }

  // Tier filter
  if (tier !== "all") {
    customers = customers.filter((c) => c.tier === tier);
  }

  // Activity filter
  if (activity === "7days") {
    customers = customers.filter((c) => c.lastOrderAt && new Date(c.lastOrderAt).getTime() >= activity7);
  } else if (activity === "30days") {
    customers = customers.filter((c) => c.lastOrderAt && new Date(c.lastOrderAt).getTime() >= activity30);
  }

  // Sort
  if (sort === "spend") {
    customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sort === "recent") {
    customers.sort((a, b) => new Date(b.lastOrderAt || 0).getTime() - new Date(a.lastOrderAt || 0).getTime());
  } else if (sort === "alpha") {
    customers.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default: most orders
    customers.sort((a, b) => b.orderCount - a.orderCount);
  }

  // Top stats
  const totalUnique = customers.length;
  const repeat = customers.filter((c) => c.orderCount >= 2).length;
  const avgOrdersPerCustomer =
    totalUnique > 0
      ? Math.round((customers.reduce((s, c) => s + c.orderCount, 0) / totalUnique) * 10) / 10
      : 0;
  const topCustomer = customers[0] || null;

  // Paginate
  const total = customers.length;
  const paginated = customers.slice(offset, offset + limit);

  return NextResponse.json({
    customers: paginated,
    total,
    stats: {
      totalUnique,
      repeat,
      repeatPct: totalUnique > 0 ? Math.round((repeat / totalUnique) * 100) : 0,
      avgOrdersPerCustomer,
      topCustomer: topCustomer
        ? { name: topCustomer.name, orderCount: topCustomer.orderCount, totalSpent: topCustomer.totalSpent }
        : null,
    },
  });
}
