import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/admin/settings/SettingsClient";

// Opt out of caching due to the necessity of fresh global state
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = createClient();
  
  const [settingsResponse, hoursResponse] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).single(),
    supabase.from("operating_hours").select("*").order("id", { ascending: true })
  ]);

  const initialSettings = settingsResponse.data || {
    id: 1,
    is_open: true,
    estimated_wait_minutes: 15,
    max_active_orders: 20,
    announcement: "",
    closed_reason: "",
    whatsapp_number: "919924247897"
  };

  const initialHours = hoursResponse.data || [];

  return (
    <div className="w-full h-[calc(100vh-1px)] bg-primary-bg overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="border-b border-white/5 py-4 px-6 md:px-8 bg-card-bg/20 shrink-0">
        <h1 className="font-display italic font-black text-2xl md:text-3xl text-white drop-shadow-md">
          Global <span className="text-accent-gold">Parameters</span>
        </h1>
        <p className="text-white/40 text-xs md:text-sm tracking-wide mt-1">
          Adjust store availability, automated pacing, and public broadcasting messages.
        </p>
      </div>

      <SettingsClient 
        initialSettings={initialSettings} 
        initialHours={initialHours} 
      />
    </div>
  );
}
