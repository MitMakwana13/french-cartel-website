"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockStatus } from "@/lib/supabase/types";

export default function StockStrip() {
  const [items, setItems] = useState<{ id: string; name: string; stock_status: StockStatus }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(() => {
    fetch("/api/menu/stock")
      .then((r) => r.json())
      .then((json) => setItems(json.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const lowItems = items.filter((i) => i.stock_status === "low_stock");
  const outItems = items.filter((i) => i.stock_status === "out_of_stock");
  const allGood = lowItems.length === 0 && outItems.length === 0;

  const toggleItem = async (id: string, current: StockStatus) => {
    const next = current === "out_of_stock" ? "in_stock" : "out_of_stock";
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock_status: next } : i));
    await fetch("/api/menu/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: [{ id, stock_status: next }] }),
    }).catch(() => fetchStock());
  };

  if (loading) return null;

  return (
    <div className={`px-4 md:px-0 mb-4 border rounded-sm px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-bold
      ${allGood ? "border-green-400/15 bg-green-400/5" : "border-amber-400/15 bg-amber-400/5"}`}>
      {allGood ? (
        <span className="text-green-400">✅ All items available</span>
      ) : (
        <>
          {lowItems.length > 0 && (
            <span className="text-amber-400">
              ⚡ Low: {lowItems.map((i) => (
                <button key={i.id} onClick={() => toggleItem(i.id, i.stock_status)}
                  className="underline underline-offset-2 ml-1 hover:no-underline">{i.name}</button>
              ))}
            </span>
          )}
          {outItems.length > 0 && (
            <span className="text-[#ef4444]">
              ❌ Out: {outItems.map((i) => (
                <button key={i.id} onClick={() => toggleItem(i.id, i.stock_status)}
                  className="underline underline-offset-2 ml-1 hover:no-underline">{i.name}</button>
              ))}
            </span>
          )}
          <span className="text-white/20 text-[0.6rem] ml-auto">tap to toggle</span>
        </>
      )}
    </div>
  );
}
