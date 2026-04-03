"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from "recharts";
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingBag,
  Clock, Flame, Camera, Loader, Star
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────
type Period = "today" | "yesterday" | "week" | "custom";

interface SalesData {
  revenue: number;
  orderCount: number;
  cancelledCount: number;
  completedCount: number;
  activeCount: number;
  avgOrderValue: number;
  yesterdayRevenue: number;
  yesterdayCount: number;
  yesterdayAOV: number;
  topSize: { name: string; count: number } | null;
  sizeBreakdown: { name: string; count: number; revenue: number; pct: number }[];
  sauceBreakdown: { name: string; count: number }[];
  addonBreakdown: { name: string; count: number; revenue: number }[];
  hourlyOrders: { hour: number; label: string; orders: number }[];
  peakHour: { label: string; orders: number } | null;
  dailyRevenue: { label: string; revenue: number; orders: number }[];
}

// ── Helper: format currency ─────────────────────────────────────────────
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

// ── Skeleton ────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-sm ${className}`} />;
}

// ── Stat Card ───────────────────────────────────────────────────────────
function StatCard({
  title, value, subtitle, change, loading, icon: Icon
}: {
  title: string; value: string; subtitle?: string;
  change?: number | null; loading: boolean; icon: React.ElementType;
}) {
  return (
    <div className="bg-[#111111] border border-white/5 p-5 flex flex-col gap-2 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-[0.65rem] font-bold uppercase tracking-[2.5px]">{title}</p>
        <Icon size={14} className="text-white/20" />
      </div>
      {loading ? (
        <>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <p className="text-3xl font-black text-[#f5c518] font-display tracking-tight">{value}</p>
          {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
          {change !== null && change !== undefined ? (
            <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? "text-green-400" : "text-[#ef4444]"}`}>
              {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(change)}% vs yesterday
            </div>
          ) : (
            <p className="text-white/25 text-xs">First day tracking!</p>
          )}
        </>
      )}
    </div>
  );
}

// ── Custom Tooltip for Bar Chart ────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs shadow-xl">
      <p className="font-black text-[#f5c518]">{label}</p>
      <p className="text-white/70">{fmt(payload[0]?.value)} · {payload[0]?.payload?.orders} orders</p>
    </div>
  );
}

function HourlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs shadow-xl">
      <p className="font-black text-white">{label}</p>
      <p className="text-[#f5c518]">{payload[0]?.value} orders</p>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function SalesDashboard() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales?period=${p}`);
      const json = await res.json();
      setData(json);
    } catch {
      showToast("Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  // Screenshot / WhatsApp report generator
  const copyReport = () => {
    if (!data) return;
    const dateLabel = new Date().toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata"
    });
    const text =
      `🍟 FRENCH CARTEL — Daily Report\n` +
      `📅 ${dateLabel}\n\n` +
      `💰 Revenue: ${fmt(data.revenue)}\n` +
      `📦 Orders: ${data.orderCount} (${data.cancelledCount} cancelled)\n` +
      `📊 Avg Order: ${fmt(data.avgOrderValue)}\n\n` +
      (data.topSize ? `🏆 Top Size: ${data.topSize.name} (${data.topSize.count} orders)\n` : "") +
      (data.sauceBreakdown[0] ? `🌶️ Top Sauce: ${data.sauceBreakdown[0].name} (${data.sauceBreakdown[0].count} orders)\n` : "") +
      (data.addonBreakdown[0] ? `🧀 Top Add-on: ${data.addonBreakdown[0].name} (${data.addonBreakdown[0].count} orders)\n` : "") +
      (data.peakHour ? `\n🔥 Peak Hour: ${data.peakHour.label} (${data.peakHour.orders} orders)` : "");

    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard! 📋");
    });
  };

  const weekTotal = data?.dailyRevenue.reduce((s, d) => s + d.revenue, 0) || 0;
  const weekOrders = data?.dailyRevenue.reduce((s, d) => s + d.orders, 0) || 0;

  // Only show hourly chart during operational hours 12–23
  const hourlyFiltered = data?.hourlyOrders.filter(h => h.hour >= 11 && h.hour <= 23) || [];
  const maxHourly = Math.max(...hourlyFiltered.map(h => h.orders), 1);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
            Sales Analytics
          </h1>
          <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold mt-1">Revenue Intelligence</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex bg-[#111] border border-white/8 overflow-hidden">
            {(["today", "yesterday", "week"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                  ${period === p
                    ? "bg-[#f5c518] text-black"
                    : "text-white/40 hover:text-white"}`}
              >
                {p === "today" ? "Today" : p === "yesterday" ? "Yesterday" : "This Week"}
              </button>
            ))}
          </div>

          {/* Screenshot Button */}
          <button
            onClick={copyReport}
            disabled={loading || !data}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
          >
            <Camera size={13} />
            Copy Report
          </button>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Revenue"
          value={loading ? "—" : fmt(data?.revenue || 0)}
          subtitle={loading ? "" : `from ${data?.orderCount || 0} orders`}
          change={loading ? null : pctChange(data?.revenue || 0, data?.yesterdayRevenue || 0)}
          loading={loading}
          icon={IndianRupee}
        />
        <StatCard
          title="Orders"
          value={loading ? "—" : String(data?.orderCount || 0)}
          subtitle={loading ? "" : `${data?.completedCount || 0} done · ${data?.activeCount || 0} active · ${data?.cancelledCount || 0} cancelled`}
          change={loading ? null : pctChange(data?.orderCount || 0, data?.yesterdayCount || 0)}
          loading={loading}
          icon={ShoppingBag}
        />
        <StatCard
          title="Avg Order Value"
          value={loading ? "—" : fmt(data?.avgOrderValue || 0)}
          subtitle="per non-cancelled order"
          change={loading ? null : pctChange(data?.avgOrderValue || 0, data?.yesterdayAOV || 0)}
          loading={loading}
          icon={TrendingUp}
        />
        <StatCard
          title="Top Size Today"
          value={loading ? "—" : (data?.topSize?.name || "—")}
          subtitle={loading ? "" : data?.topSize ? `${data.topSize.count} orders sold` : "No data yet"}
          change={null}
          loading={loading}
          icon={Star}
        />
      </div>

      {/* ── 7-Day Revenue Chart ── */}
      <div className="bg-[#111] border border-white/5 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white font-black uppercase tracking-wide text-sm">7-Day Revenue</p>
            {!loading && (
              <p className="text-white/30 text-xs mt-0.5">
                This week: <span className="text-[#f5c518] font-bold">{fmt(weekTotal)}</span> from {weekOrders} orders
              </p>
            )}
          </div>
          {loading && <Loader size={14} className="text-white/30 animate-spin" />}
        </div>

        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.dailyRevenue || []} barCategoryGap="30%">
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(245,197,24,0.05)" }} />
              <Bar dataKey="revenue" fill="#f5c518" radius={[2, 2, 0, 0]}
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Popular Items ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Size Breakdown */}
        <div className="bg-[#111] border border-white/5 p-5 col-span-1">
          <p className="text-white font-black uppercase tracking-wide text-sm mb-5">Size Breakdown</p>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : data?.sizeBreakdown.length === 0 ? (
            <p className="text-white/20 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {data?.sizeBreakdown.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white font-bold">{s.name}</span>
                    <span className="text-white/40">{s.count} · {s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f5c518] rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className="text-white/25 text-[0.65rem] mt-1">{fmt(s.revenue)} revenue</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Sauces */}
        <div className="bg-[#111] border border-white/5 p-5">
          <p className="text-white font-black uppercase tracking-wide text-sm mb-5">🌶️ Top Sauces</p>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : data?.sauceBreakdown.length === 0 ? (
            <p className="text-white/20 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data?.sauceBreakdown.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#f5c518] font-black text-sm shrink-0">#{i + 1}</span>
                    <span className="text-white/80 text-sm font-bold truncate">{s.name}</span>
                  </div>
                  <span className="text-white/40 text-xs shrink-0">{s.count} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Add-ons */}
        <div className="bg-[#111] border border-white/5 p-5">
          <p className="text-white font-black uppercase tracking-wide text-sm mb-5">🧀 Top Add-ons</p>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : data?.addonBreakdown.length === 0 ? (
            <p className="text-white/20 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data?.addonBreakdown.map((a, i) => (
                <div key={a.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#f5c518] font-black text-sm shrink-0">#{i + 1}</span>
                    <span className="text-white/80 text-sm font-bold truncate">{a.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white/40 text-xs">{a.count} orders</p>
                    <p className="text-[#f5c518] text-[0.6rem] font-bold">{fmt(a.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Hourly Timeline ── */}
      <div className="bg-[#111] border border-white/5 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white font-black uppercase tracking-wide text-sm">Orders Timeline</p>
            <p className="text-white/30 text-xs mt-0.5">Hourly breakdown · IST</p>
          </div>
          {!loading && data?.peakHour && (
            <div className="flex items-center gap-2 bg-[#f5c518]/10 border border-[#f5c518]/20 px-3 py-1.5 text-xs">
              <Flame size={12} className="text-[#f5c518]" />
              <span className="text-white/60">Peak:</span>
              <span className="text-[#f5c518] font-black">{data.peakHour.label} — {data.peakHour.orders} orders</span>
            </div>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: 500 }}>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={hourlyFiltered}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5c518" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f5c518" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis hide />
                  <Tooltip content={<HourlyTooltip />} cursor={{ stroke: "rgba(245,197,24,0.2)" }} />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#f5c518"
                    strokeWidth={2}
                    fill="url(#goldGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
