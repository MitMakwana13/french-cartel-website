import { createClient } from "@/lib/supabase/server";
import OrdersDashboardClient from "@/components/admin/orders/OrdersDashboardClient";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-full h-[calc(100vh-1px)] bg-primary-bg overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="border-b border-white/5 py-4 px-6 md:px-8 bg-card-bg/20 shrink-0">
        <h1 className="font-display italic font-black text-2xl md:text-3xl text-white drop-shadow-md">
          Orders <span className="text-accent-gold">Dashboard</span>
        </h1>
        <p className="text-white/40 text-xs md:text-sm tracking-wide mt-1">
          Command center is online. Listening for live dispatches.
        </p>
      </div>

      {/* Main Realtime Client Application */}
      <div className="flex-1 overflow-hidden relative">
        <OrdersDashboardClient />
      </div>
    </div>
  );
}
