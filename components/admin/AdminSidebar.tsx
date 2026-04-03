"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Utensils, Settings, LogOut, Volume2, VolumeX, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [newCount, setNewCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
     if (typeof window !== "undefined") {
        setIsMuted(window.localStorage.getItem("admin_muted") === "true");
     }
  }, []);

  const toggleMute = () => {
     const nextVal = !isMuted;
     setIsMuted(nextVal);
     window.localStorage.setItem("admin_muted", String(nextVal));
  };

  // Fetch initial store status and subscribe to realtime updates
  useEffect(() => {
    const fetchDependencies = async () => {
      const [settingsRes, ordersRes] = await Promise.all([
        supabase.from("store_settings").select("is_open").eq("id", 1).single(),
        supabase.from("orders").select("id", { count: "exact" }).eq("status", "new")
      ]);
        
      if (!settingsRes.error && settingsRes.data) setIsOpen(settingsRes.data.is_open);
      if (!ordersRes.error && ordersRes.count !== null) setNewCount(ordersRes.count);
    };

    fetchDependencies();

    const channel = supabase
      .channel("public:store_settings")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "store_settings",
          filter: "id=eq.1",
        },
        (payload) => {
          setIsOpen(payload.new.is_open);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: "status=eq.new" },
        () => {
           // On any change to 'new' orders locally refresh the count safely via lightweight aggregate fetch
           supabase.from("orders").select("id", { count: "exact" }).eq("status", "new").then(res => {
              if (res.count !== null) setNewCount(res.count);
           });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
           // Listen for orders transitioning OUT of 'new' to deduct counts dynamically
           // We re-aggregate to ensure zero race conditions natively
           supabase.from("orders").select("id", { count: "exact" }).eq("status", "new").then(res => {
              if (res.count !== null) setNewCount(res.count);
           });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { name: "Orders", href: "/admin", icon: ClipboardList },
    { name: "Sales", href: "/admin/sales", icon: TrendingUp },
    { name: "Menu", href: "/admin/menu", icon: Utensils },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] bg-card-bg border-r border-white/5 h-screen">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display italic font-black text-2xl text-accent-gold drop-shadow-sm">
            French Cartel
          </h2>
          <span className="inline-block mt-1 bg-accent-gold/10 text-accent-gold text-[0.6rem] uppercase tracking-[2px] px-2 py-0.5 rounded-sm font-bold">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-accent-gold/10 text-accent-gold border-l-[3px] border-accent-gold"
                    : "text-white/50 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
                }`}
              >
                <item.icon size={18} />
                {item.name}
                {item.name === "Orders" && newCount > 0 && (
                   <span className="ml-auto bg-[#ef4444] text-white text-[0.65rem] font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                      {newCount} NEW
                   </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <span className="relative flex h-3 w-3">
              {isOpen && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOpen ? "bg-[#34d399]" : "bg-[#ef4444]"
                }`}
              ></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">
              {isOpen ? "Store Open" : "Store Closed"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
             <button
               onClick={toggleMute}
               className="flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-200 text-sm font-bold uppercase tracking-wide px-2 w-full text-left"
             >
               {isMuted ? <VolumeX size={16} className="text-[#ef4444]" /> : <Volume2 size={16} />}
               {isMuted ? "Audio Muted" : "Mute Dashboard"}
             </button>

             <button
               onClick={handleSignOut}
               className="flex items-center gap-2 text-white/30 hover:text-[#ef4444] transition-colors duration-200 text-sm font-bold uppercase tracking-wide px-2 w-full text-left"
             >
               <LogOut size={16} />
               Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card-bg border-t border-white/10 z-[100] pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                  isActive ? "text-accent-gold" : "text-white/40 hover:text-white/70"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">
                  {item.name}
                </span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-white/40 hover:text-[#ef4444] transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="text-[0.6rem] font-bold uppercase tracking-widest">
              Exit
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
