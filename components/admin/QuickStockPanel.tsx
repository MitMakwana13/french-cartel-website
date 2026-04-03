"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Package, X, ChevronDown, RotateCcw, BarChart2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { StockStatus } from "@/lib/supabase/types";

// ── Types ──────────────────────────────────────────────────────────────────
interface StockItem {
  id: string;
  name: string;
  category: string;
  emoji: string | null;
  stock_status: StockStatus;
  is_available: boolean;
  daily_limit: number | null;
  daily_sold_count: number;
}

// ── Category Config ────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  size: { label: "Sizes", emoji: "🍟" },
  sauce: { label: "Sauces", emoji: "🌶️" },
  seasoning: { label: "Seasonings", emoji: "🧂" },
  addon: { label: "Add-ons", emoji: "🧀" },
  drink: { label: "Drinks", emoji: "🥤" },
};

const CATEGORY_ORDER = ["size", "sauce", "seasoning", "addon", "drink"];

// ── Stock Cycle ────────────────────────────────────────────────────────────
function nextStatus(current: StockStatus): StockStatus {
  if (current === "in_stock") return "low_stock";
  if (current === "low_stock") return "out_of_stock";
  return "in_stock";
}

// ── Stock Chip ─────────────────────────────────────────────────────────────
function StockChip({
  item,
  onToggle,
  onResetCount,
}: {
  item: StockItem;
  onToggle: (id: string, newStatus: StockStatus) => void;
  onResetCount: (id: string) => void;
}) {
  const next = nextStatus(item.stock_status);
  const hasLimit = item.daily_limit !== null && item.daily_limit > 0;
  const isLimitReached = hasLimit && item.daily_sold_count >= (item.daily_limit || 0);

  const chipStyle =
    item.stock_status === "out_of_stock"
      ? "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]/70"
      : item.stock_status === "low_stock"
      ? "bg-amber-400/10 border-amber-400/40 text-amber-300"
      : "bg-white/5 border-white/15 text-white/80 hover:border-white/30";

  const dot =
    item.stock_status === "out_of_stock"
      ? "bg-[#ef4444]"
      : item.stock_status === "low_stock"
      ? "bg-amber-400"
      : "bg-green-400";

  return (
    <div className="relative group">
      <button
        onClick={() => onToggle(item.id, next)}
        className={`flex flex-col items-start gap-1 p-3 border text-[0.7rem] font-bold tracking-wide transition-colors min-h-[56px] w-[110px] text-left appearance-none ${chipStyle}`}
        title={`Status: ${item.stock_status}. Tap to cycle.`}
      >
        <div className="flex items-center gap-2 w-full">
          <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className="truncate flex-1">
            {item.emoji ? `${item.emoji} ` : ""}
            {item.name}
          </span>
        </div>
        
        {hasLimit && (
          <div className="flex items-center gap-1.5 mt-0.5 text-[0.6rem] opacity-60">
            <BarChart2 size={10} />
            <span className={isLimitReached ? "text-[#ef4444]" : ""}>
              {item.daily_sold_count}/{item.daily_limit}
            </span>
          </div>
        )}
      </button>

      {hasLimit && (
        <button
          onClick={(e) => { e.stopPropagation(); onResetCount(item.id); }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white/50 hover:text-white"
          title="Reset daily count"
        >
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  );
}

// ── Quick Panel ────────────────────────────────────────────────────────────
function QuickStockPanel({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu/stock")
      .then((r) => r.json())
      .then((json) => setItems(json.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = useCallback(
    async (id: string, newStatus: StockStatus) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, stock_status: newStatus, is_available: newStatus !== "out_of_stock" }
            : i
        )
      );

      const item = items.find((i) => i.id === id);
      const label =
        newStatus === "out_of_stock"
          ? `${item?.name} marked out of stock ❌`
          : newStatus === "low_stock"
          ? `${item?.name} — almost gone ⚡`
          : `${item?.name} back in stock ✅`;

      try {
        const res = await fetch("/api/menu/stock", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [{ id, stock_status: newStatus }] }),
        });
        if (!res.ok) throw new Error("Failed");
        showToast(label);
      } catch {
        // Revert optimistic update
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, stock_status: item?.stock_status || "in_stock", is_available: item?.is_available ?? true }
              : i
          )
        );
        showToast("Failed to update. Try again.");
      }
    },
    [items, showToast]
  );

  const handleResetCount = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, daily_sold_count: 0, stock_status: 'in_stock', is_available: true } : i));

    try {
      const res = await fetch("/api/menu/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ id, reset_daily_count: true }] }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(`${item.name} sales count reset! ✅`);
    } catch {
      setItems(prev => prev.map(i => i.id === id ? item : i));
      showToast("Reset failed.");
    }
  }, [items, showToast]);

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<string, StockItem[]>);

  const unavailableCount = items.filter((i) => i.stock_status !== "in_stock").length;

  const stockSummary = items
    .filter((i) => i.stock_status !== "in_stock" || (i.daily_limit && i.daily_sold_count >= i.daily_limit))
    .reduce(
      (acc, i) => {
        const atLimit = i.daily_limit && i.daily_sold_count >= i.daily_limit;
        if (i.stock_status === "low_stock") acc.low.push(i.name);
        else if (atLimit) acc.atLimit.push(i.name);
        else acc.out.push(i.name);
        return acc;
      },
      { low: [] as string[], out: [] as string[], atLimit: [] as string[] }
    );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slide in from right on desktop, slide up from bottom on mobile */}
      <div className="fixed z-[80] md:right-0 md:top-0 md:h-full md:w-[380px] bottom-0 left-0 right-0 md:left-auto bg-[#111111] border-t md:border-t-0 md:border-l border-white/10 flex flex-col shadow-2xl md:max-h-full max-h-[75vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="font-black text-white text-sm uppercase tracking-widest">Quick Stock</h2>
            <p className="text-white/30 text-[0.6rem] mt-0.5">Tap chips to cycle: In Stock → Low → Out</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Stock summary strip */}
        {!loading && (unavailableCount > 0 || stockSummary.atLimit.length > 0) && (
          <div className="px-4 py-2.5 bg-[#0a0a0a] border-b border-white/5 shrink-0">
            {stockSummary.atLimit.length > 0 && (
              <p className="text-accent-gold text-[0.65rem] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <BarChart2 size={12} /> Limit Reached: {stockSummary.atLimit.join(", ")}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {stockSummary.low.length > 0 && (
                <p className="text-amber-400 text-[0.65rem] font-bold">⚡ Low: {stockSummary.low.join(", ")}</p>
              )}
              {stockSummary.out.length > 0 && (
                <p className="text-[#ef4444] text-[0.65rem] font-bold">❌ Out: {stockSummary.out.join(", ")}</p>
              )}
            </div>
          </div>
        )}
        {!loading && unavailableCount === 0 && (
          <div className="px-4 py-2 bg-green-400/5 border-b border-green-400/10 shrink-0">
            <p className="text-green-400 text-xs font-bold">✅ All items in stock</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-11 w-24 bg-white/5 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            CATEGORY_ORDER.map((cat) => {
              const catItems = grouped[cat];
              if (!catItems || catItems.length === 0) return null;
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat}>
                  <p className="text-white/40 text-[0.65rem] uppercase tracking-[2.5px] font-black mb-2.5">
                    {meta.emoji} {meta.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {catItems.map((item) => (
                      <StockChip key={item.id} item={item} onToggle={handleToggle} onResetCount={handleResetCount} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center gap-4 text-[0.6rem] text-white/30 font-bold shrink-0">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />In Stock</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Low Stock</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Out of Stock</span>
        </div>
      </div>
    </>
  );
}

// ── Floating Action Button (exported — inject in admin layout) ─────────────
export default function QuickStockFAB() {
  const [open, setOpen] = useState(false);
  const [unavailableCount, setUnavailableCount] = useState(0);

  // Poll for badge count on mount & every 30s
  const refresh = useCallback(() => {
    fetch("/api/menu/stock")
      .then((r) => r.json())
      .then((json) => {
        const items = json.data || [];
        setUnavailableCount(items.filter((i: StockItem) => i.stock_status !== "in_stock").length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[60] w-14 h-14 bg-[#111111] border border-white/15 hover:border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center transition-colors group"
        title="Quick Stock Control"
      >
        <Package size={22} className="text-white/60 group-hover:text-white transition-colors" />
        {unavailableCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ef4444] text-white text-[0.6rem] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {unavailableCount > 9 ? "9+" : unavailableCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && <QuickStockPanel onClose={() => setOpen(false)} />}
    </>
  );
}
