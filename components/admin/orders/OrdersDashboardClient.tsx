"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import OrderCard from "./OrderCard";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Order, OrderStatus } from "@/lib/supabase/types";

export default function OrdersDashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"new" | "active" | "ready" | "completed">("new");
  
  // Realtime Sidebar audio context reference from localStorage or window
  const isMuted = typeof window !== "undefined" && window.localStorage.getItem("admin_muted") === "true";
  
  const supabase = createClient();
  const { showToast } = useToast();

  const playChime = () => {
    // Check global mute state
    if (typeof window !== "undefined" && window.localStorage.getItem("admin_muted") === "true") return;
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1); // E6 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio play blocked by browser policy");
    }
  };

  // Fetch initial orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const [ordersRes, settingsRes] = await Promise.all([
           fetch("/api/orders"),
           fetch("/api/settings")
        ]);
        const ordersJson = await ordersRes.json();
        const settingsJson = await settingsRes.json();
        
        if (ordersJson.data) setOrders(ordersJson.data);
        if (settingsJson.store_settings) setSettings(settingsJson.store_settings);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Set up Realtime Subscription
    const channel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev]);
          playChime();
          showToast(`🚨 NEW ORDER #${newOrder.order_number} — ₹${newOrder.total_price}`, 10000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, showToast]);

  const handleUpdateStatus = async (id: string, prevStatus: OrderStatus, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status");
      // Revert on error
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: prevStatus } : o))
      );
    }
  };

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => o.status !== "cancelled");
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.order_number.toString().includes(q)
      );
    }
    return result;
  }, [orders, search]);

  // View Computations
  const newOrders = filteredOrders.filter((o) => o.status === "new");
  const activeOrders = filteredOrders.filter((o) => ["accepted", "preparing"].includes(o.status));
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");
  const completedOrders = filteredOrders.filter((o) => o.status === "completed");

  const revenueToday = completedOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Mobile rendering toggle 
  const getMobileVisibleList = () => {
    switch (activeTab) {
      case "new": return newOrders;
      case "active": return activeOrders;
      case "ready": return readyOrders;
      case "completed": return completedOrders;
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-4 md:pt-8 md:px-8">
      
      {/* Top Stats Strip & Throttle Warning */}
      {settings && settings.max_active_orders > 0 && (newOrders.length + activeOrders.length) >= Math.floor(settings.max_active_orders * 0.9) && (
        <div className="bg-[#ef4444]/20 border-l-4 border-[#ef4444] px-4 py-3 mb-6 rounded-r-sm max-w-2xl mx-auto md:mx-0 animate-pulse">
           <p className="text-[#ef4444] font-black uppercase tracking-widest text-sm flex items-center gap-2">
             ⚠️ Approaching Order Limit ({newOrders.length + activeOrders.length} / {settings.max_active_orders})
           </p>
           {newOrders.length + activeOrders.length >= settings.max_active_orders && (
              <p className="text-white/70 text-xs mt-1">Automatic storefront suspending is engaged to prevent overflow. Queue is saturated.</p>
           )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6 px-4 md:px-0">
        <div className="flex-1 bg-card-bg border border-white/5 p-4 rounded-sm">
          <p className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold">🔥 Active Orders</p>
          <p className="text-2xl font-black text-white">{newOrders.length + activeOrders.length}</p>
        </div>
        <div className="flex-1 bg-card-bg border border-white/5 p-4 rounded-sm">
          <p className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold">✅ Completed</p>
          <p className="text-2xl font-black text-white">{completedOrders.length}</p>
        </div>
        <div className="flex-1 bg-card-bg border border-white/5 p-4 rounded-sm">
          <p className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold">💰 M-Revenue</p>
          <p className="text-2xl font-black text-accent-gold">₹{revenueToday}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-4 mb-6 px-4 md:px-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Search #1001, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card-bg border border-white/10 text-white placeholder:text-white/30 text-sm pl-10 pr-4 py-2.5 rounded-sm focus:outline-none focus:border-accent-gold transition-colors"
          />
        </div>
      </div>

      {/* Mobile Tab Bar (< md breakpoint) */}
      <div className="md:hidden flex border-b border-white/10 mb-4 px-2">
        {(["new", "active", "ready", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest relative transition-colors ${
              activeTab === tab ? "text-accent-gold" : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab}
            {tab === "new" && newOrders.length > 0 && (
              <span className="absolute top-0 right-1/4 -mt-2 -mr-3 bg-[#ef4444] text-white text-[0.55rem] px-1.5 py-0.5 rounded-full z-10">
                {newOrders.length}
              </span>
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-gold"></div>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Kanban List View */}
      <div className="md:hidden flex-1 overflow-y-auto px-4 pb-20 space-y-4">
        {loading ? (
          <div className="text-white/30 text-center py-10 text-sm italic tracking-widest">Loading operations...</div>
        ) : getMobileVisibleList().length === 0 ? (
          <div className="text-white/20 text-center py-10 text-xs tracking-widest uppercase">No orders here</div>
        ) : (
          getMobileVisibleList().map((o) => (
            <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />
          ))
        )}
      </div>

      {/* Desktop Kanban Board (>= md breakpoint) */}
      <div className="hidden md:flex flex-1 gap-6 pb-6 h-[calc(100vh-280px)]">
        
        {/* NEW COLUMN */}
        <div className="flex flex-col flex-1 border-t-[3px] border-accent-gold/80 bg-card-bg/30 rounded-t-sm">
          <div className="p-4 border-b border-white/5 flex gap-2 items-center bg-card-bg/60">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent-gold">New</h2>
            <span className="bg-accent-gold/20 text-accent-gold text-xs px-2 py-0.5 rounded-full">{newOrders.length}</span>
            {newOrders.length > 0 && <span className="ml-auto flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-accent-gold"></span></span>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {newOrders.map((o) => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
            {newOrders.length === 0 && !loading && <p className="text-white/10 text-center text-xs uppercase tracking-widest mt-10">Queue Empty</p>}
          </div>
        </div>

        {/* ACTIVE COLUMN */}
        <div className="flex flex-col flex-1 border-t-[3px] border-[#38bdf8]/80 bg-card-bg/30 rounded-t-sm">
          <div className="p-4 border-b border-white/5 flex gap-2 items-center bg-card-bg/60">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#38bdf8]">Active</h2>
            <span className="bg-[#38bdf8]/20 text-[#38bdf8] text-xs px-2 py-0.5 rounded-full">{activeOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeOrders.map((o) => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
            {activeOrders.length === 0 && !loading && <p className="text-white/10 text-center text-xs uppercase tracking-widest mt-10">No Active Kitchen Orders</p>}
          </div>
        </div>

        {/* READY COLUMN */}
        <div className="flex flex-col flex-1 border-t-[3px] border-[#34d399]/80 bg-card-bg/30 rounded-t-sm">
          <div className="p-4 border-b border-white/5 flex gap-2 items-center bg-card-bg/60">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#34d399]">Ready</h2>
            <span className="bg-[#34d399]/20 text-[#34d399] text-xs px-2 py-0.5 rounded-full">{readyOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {readyOrders.map((o) => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
            {readyOrders.length === 0 && !loading && <p className="text-white/10 text-center text-xs uppercase tracking-widest mt-10">Awaiting Pickups</p>}
          </div>
        </div>

        {/* COMPLETED COLUMN */}
        <div className="flex flex-col flex-1 border-t-[3px] border-white/20 bg-card-bg/30 rounded-t-sm opacity-60 hover:opacity-100 transition-opacity">
          <div className="p-4 border-b border-white/5 flex gap-2 items-center bg-card-bg/60">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Done</h2>
            <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full">{completedOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {completedOrders.map((o) => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
            {completedOrders.length === 0 && !loading && <p className="text-white/10 text-center text-xs uppercase tracking-widest mt-10">Clear Board</p>}
          </div>
        </div>

      </div>

    </div>
  );
}
