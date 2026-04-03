"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, Search, ChevronDown, ChevronUp, MessageCircle,
  Copy, Phone, Crown, Gem, Medal, Award, Filter, Send, X, Loader
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/components/ui/Toast";

// ── Types ───────────────────────────────────────────────────────────────────
type Tier = "bronze" | "silver" | "gold" | "diamond";

interface Customer {
  phone: string;
  name: string;
  orderCount: number;
  cancelledCount: number;
  totalSpent: number;
  avgOrder: number;
  lastOrderAt: string;
  favSize: string | null;
  tier: Tier;
  latestOrder: {
    order_number: number;
    status: string;
    total_price: number;
    created_at: string;
    items: any;
  } | null;
}

interface CustomerDetail {
  orders: any[];
  stats: { totalOrders: number; cancelledCount: number; totalSpent: number; avgOrder: number };
  preferences: { topSize: string | null; topSauces: string[]; topAddon: string | null; topDays: string[]; preferenceSummary: string };
}

interface Stats {
  totalUnique: number;
  repeat: number;
  repeatPct: number;
  avgOrdersPerCustomer: number;
  topCustomer: { name: string; orderCount: number; totalSpent: number } | null;
}

// ── Tier Config ──────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<Tier, { label: string; icon: React.ElementType; color: string; glow: string }> = {
  bronze: { label: "Bronze", icon: Medal, color: "text-amber-600", glow: "" },
  silver: { label: "Silver", icon: Award, color: "text-slate-400", glow: "" },
  gold: { label: "Gold", icon: Crown, color: "text-[#f5c518]", glow: "" },
  diamond: { label: "Diamond", icon: Gem, color: "text-cyan-300", glow: "shadow-[0_0_20px_rgba(103,232,249,0.12)] border-cyan-500/20" },
};

function TierBadge({ tier }: { tier: Tier }) {
  const cfg = TIER_CONFIG[tier];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[0.6rem] font-black uppercase tracking-wider px-2 py-0.5 border border-white/10 bg-white/5 ${cfg.color}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-sm ${className}`} />;
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function statusColor(status: string) {
  if (status === "completed") return "text-green-400";
  if (status === "cancelled") return "text-red-400";
  if (status === "ready") return "text-blue-400";
  return "text-white/40";
}

// ── VIP Modal ────────────────────────────────────────────────────────────────
function VipModal({ customers, onClose }: { customers: Customer[]; onClose: () => void }) {
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>(["gold", "diamond"]);
  const [message, setMessage] = useState(
    "Hey {name}! 🍟 We've got something special for you at French Cartel today! Come by and treat yourself 😊"
  );
  const filtered = customers.filter((c) => selectedTiers.includes(c.tier));

  const toggleTier = (t: Tier) =>
    setSelectedTiers((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="font-black text-white text-lg uppercase tracking-wide">Message VIPs</h2>
            <p className="text-white/30 text-xs mt-0.5">Generates individual WhatsApp links — tap each one manually</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Tier selector */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-[2px] font-bold mb-3">Select Tiers</p>
            <div className="flex flex-wrap gap-2">
              {(["bronze", "silver", "gold", "diamond"] as Tier[]).map((t) => {
                const cfg = TIER_CONFIG[t];
                const Icon = cfg.icon;
                const active = selectedTiers.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTier(t)}
                    className={`flex items-center gap-1.5 px-3 py-2 border text-xs font-bold uppercase tracking-wide transition-colors
                      ${active ? `border-[#f5c518] bg-[#f5c518]/10 text-white` : "border-white/10 text-white/30 hover:text-white"}`}
                  >
                    <Icon size={12} className={active ? cfg.color : ""} /> {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message template */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-[2px] font-bold mb-2">Message Template</p>
            <p className="text-white/25 text-xs mb-2">Use <code className="text-[#f5c518]">{"{name}"}</code> to personalize</p>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#f5c518] resize-none"
            />
          </div>

          {/* Generated links */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-[2px] font-bold mb-3">
              {filtered.length} customers — tap each link to open WhatsApp
            </p>
            {filtered.length === 0 ? (
              <p className="text-white/20 text-sm">No customers match selected tiers.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {filtered.map((c) => {
                  const personalMessage = message.replace("{name}", c.name.split(" ")[0]);
                  const waUrl = `https://wa.me/91${c.phone}?text=${encodeURIComponent(personalMessage)}`;
                  return (
                    <a
                      key={c.phone}
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-[#25D366]/10 border border-[#25D366]/20 hover:border-[#25D366]/50 px-4 py-3 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{c.name}</p>
                        <p className="text-white/30 text-xs">{c.phone}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TierBadge tier={c.tier} />
                        <MessageCircle size={16} className="text-[#25D366]" />
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Customer Detail Expandable ────────────────────────────────────────────────
function CustomerDetail({ phone, waMessage }: { phone: string; waMessage: string }) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [phone]);

  if (loading) return (
    <div className="p-5 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
  if (!detail) return <p className="p-5 text-white/30 text-sm">Failed to load.</p>;

  return (
    <div className="border-t border-white/5 bg-[#0a0a0a] p-5 space-y-5">
      {/* Preferences */}
      {detail.preferences.preferenceSummary && (
        <div className="bg-[#f5c518]/5 border border-[#f5c518]/10 px-4 py-3">
          <p className="text-white/40 text-[0.6rem] uppercase tracking-[2px] font-bold mb-1">Preferences</p>
          <p className="text-white/80 text-sm">{detail.preferences.preferenceSummary}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/30">
            <span>Avg: <span className="text-[#f5c518] font-bold">{fmt(detail.stats.avgOrder)}</span></span>
            {detail.preferences.topDays.length > 0 && (
              <span>Peak days: <span className="text-white/60 font-bold">{detail.preferences.topDays.join(", ")}</span></span>
            )}
          </div>
        </div>
      )}

      {/* Order History */}
      <div>
        <p className="text-white/40 text-[0.6rem] uppercase tracking-[2px] font-bold mb-3">Order History</p>
        <div className="space-y-2">
          {detail.orders.slice(0, 10).map((o: any) => {
            const items = o.items || {};
            const summary = [
              items.size?.name,
              ...(items.sauces || []).slice(0, 1),
              ...(items.addons || []).slice(0, 1).map((a: any) => a.name),
            ].filter(Boolean).join(", ");
            return (
              <div key={o.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                <div className="min-w-0">
                  <span className="text-[#f5c518] font-black mr-2">#{o.order_number}</span>
                  <span className="text-white/30 text-xs">{format(new Date(o.created_at), "d MMM, h:mm a")}</span>
                  <p className="text-white/50 text-xs truncate">{summary}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-white font-bold">{fmt(o.total_price)}</p>
                  <p className={`text-xs font-bold ${statusColor(o.status)}`}>{o.status}</p>
                </div>
              </div>
            );
          })}
          {detail.orders.length > 10 && (
            <p className="text-white/20 text-xs text-center pt-1">+ {detail.orders.length - 10} older orders</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Customer Row ──────────────────────────────────────────────────────────────
function CustomerRow({ customer, expanded, onToggle }: {
  customer: Customer;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { showToast } = useToast();
  const cfg = TIER_CONFIG[customer.tier];

  const waMsg = encodeURIComponent(
    `Hey ${customer.name.split(" ")[0]}! 👋 Thanks for being a loyal French Cartel customer. We've got something special for you today! 🍟`
  );
  const waUrl = `https://wa.me/91${customer.phone}?text=${waMsg}`;

  const copyPhone = () => {
    navigator.clipboard.writeText(customer.phone);
    showToast("Phone copied! 📋");
  };

  const lastOrder = customer.lastOrderAt
    ? formatDistanceToNow(new Date(customer.lastOrderAt), { addSuffix: true })
    : "—";

  return (
    <div className={`border border-white/5 transition-colors ${customer.tier === "diamond" ? cfg.glow : ""}`}>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm bg-white/5 border border-white/10 ${cfg.color}`}>
          {customer.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-white text-sm">{customer.name}</p>
            <TierBadge tier={customer.tier} />
          </div>
          <p className="text-white/30 text-xs mt-0.5">{customer.phone}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
            <span className="text-[#f5c518] font-black">{customer.orderCount} orders</span>
            <span className="text-white/60 font-bold">{fmt(customer.totalSpent)}</span>
            {customer.favSize && <span className="text-white/30">⭐ {customer.favSize}</span>}
            <span className="text-white/25">{lastOrder}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick actions */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-sm transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={16} />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); copyPhone(); }}
            className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
            title="Copy phone"
          >
            <Copy size={14} />
          </button>
          <div className="text-white/20">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {expanded && (
        <CustomerDetail phone={customer.phone} waMessage={waMsg} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("orders");
  const [tier, setTier] = useState("all");
  const [activity, setActivity] = useState("all");
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const fetchCustomers = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) setOffset(0);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort, tier, activity, search,
        limit: String(LIMIT),
        offset: String(currentOffset),
      });
      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      if (reset) {
        setCustomers(json.customers || []);
      } else {
        setCustomers((prev) => [...prev, ...(json.customers || [])]);
      }
      setTotal(json.total || 0);
      if (json.stats) setStats(json.stats);
    } catch {
      showToast("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [sort, tier, activity, search, offset, showToast]);

  useEffect(() => { fetchCustomers(true); }, [sort, tier, activity, search]);

  // Debounce search input
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 300);
  };

  const loadMore = () => {
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    // Trigger fetch with new offset
    const params = new URLSearchParams({ sort, tier, activity, search, limit: String(LIMIT), offset: String(nextOffset) });
    fetch(`/api/customers?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setCustomers((prev) => [...prev, ...(json.customers || [])]);
      });
  };

  const hasMore = customers.length < total;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">Customers</h1>
          <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold mt-1">Derived from order history</p>
        </div>
        <button
          onClick={() => setShowVipModal(true)}
          className="flex items-center gap-2 bg-[#f5c518] text-black font-black uppercase tracking-widest text-xs px-4 py-3 hover:bg-white transition-colors shadow-[0_0_20px_rgba(245,197,24,0.2)]"
        >
          <Send size={13} /> Message VIPs
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Unique Customers", value: stats?.totalUnique ?? "—" },
          { label: "Repeat Customers", value: stats ? `${stats.repeat} (${stats.repeatPct}%)` : "—" },
          { label: "Avg Orders / Customer", value: stats?.avgOrdersPerCustomer ?? "—" },
          {
            label: "Top Customer",
            value: stats?.topCustomer
              ? `${stats.topCustomer.name.split(" ")[0]} · ${stats.topCustomer.orderCount} orders`
              : "—",
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#111] border border-white/5 p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-[2px] font-bold mb-1">{label}</p>
            <p className="text-[#f5c518] font-black text-lg truncate">{String(value)}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full bg-[#111] border border-white/8 text-white text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#f5c518] placeholder-white/20"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#111] border border-white/8 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-[#f5c518]"
        >
          <option value="orders">Most Orders</option>
          <option value="spend">Highest Spend</option>
          <option value="recent">Most Recent</option>
          <option value="alpha">A–Z</option>
        </select>

        {/* Tier */}
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="bg-[#111] border border-white/8 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-[#f5c518]"
        >
          <option value="all">All Tiers</option>
          <option value="bronze">🥉 Bronze</option>
          <option value="silver">🥈 Silver</option>
          <option value="gold">🥇 Gold</option>
          <option value="diamond">💎 Diamond</option>
        </select>

        {/* Activity */}
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="bg-[#111] border border-white/8 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-[#f5c518]"
        >
          <option value="all">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-white/25 text-xs">
          Showing {customers.length} of {total} customers
        </p>
      )}

      {/* ── Customer List ── */}
      <div className="space-y-2">
        {loading && customers.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/5 p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-bold">No customers found</p>
            <p className="text-white/15 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerRow
              key={customer.phone}
              customer={customer}
              expanded={expandedPhone === customer.phone}
              onToggle={() =>
                setExpandedPhone(expandedPhone === customer.phone ? null : customer.phone)
              }
            />
          ))
        )}
      </div>

      {/* ── Load More ── */}
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="w-full py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Load More ({total - customers.length} remaining)
        </button>
      )}

      {loading && customers.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader size={20} className="text-[#f5c518] animate-spin" />
        </div>
      )}

      {/* ── VIP Modal ── */}
      {showVipModal && (
        <VipModal customers={customers} onClose={() => setShowVipModal(false)} />
      )}

      <div className="h-4" />
    </div>
  );
}
