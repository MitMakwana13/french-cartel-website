"use client";

import { useState } from "react";
import { formatTime24to12, formatTime12to24, getCurrentISTDayIndex } from "@/lib/utils/time";
import { useToast } from "@/components/ui/Toast";
import { Save, Power, Clock, Settings2, Users, Bell } from "lucide-react";
import type { StoreSettings, OperatingHours } from "@/lib/supabase/types";

interface SettingsClientProps {
  initialSettings: StoreSettings;
  initialHours: OperatingHours[];
}

// 48 periods corresponding to every 30 minutes in a 24-hr day
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}:00`;
});

export default function SettingsClient({ initialSettings, initialHours }: SettingsClientProps) {
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [hours, setHours] = useState<OperatingHours[]>(initialHours);
  const [loading, setLoading] = useState(false);

  const todayIndex = getCurrentISTDayIndex();
  const todayHourObj = hours.find(h => h.id === todayIndex)!;

  const patchSettings = async (updates: Partial<StoreSettings>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.store_settings) setSettings(json.store_settings);
      showToast("Settings saved successfully");
    } catch {
      showToast("Error saving configurations");
    } finally {
      setLoading(false);
    }
  };

  const patchHours = async (updates: Partial<OperatingHours>[]) => {
    setLoading(true);
    try {
      await fetch("/api/settings/hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: updates }),
      });
      showToast("Schedule updated successfully");
    } catch {
      showToast("Error flushing schedule configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleMasterToggle = () => {
    patchSettings({ is_open: !settings.is_open });
  };

  const handleScheduleToggleAll = (modelId: number) => {
    const templateRow = hours.find(h => h.id === modelId);
    if (!templateRow) return;

    if (!confirm(`Apply the times from ${templateRow.day_name} sequentially across Monday-Saturday?`)) return;

    const newHours = [...hours];
    newHours.forEach(h => {
       // Only apply to Mon(1) through Sat(6)
       if (h.id >= 1 && h.id <= 6) {
          h.is_open = templateRow.is_open;
          h.open_time = templateRow.open_time;
          h.close_time = templateRow.close_time;
       }
    });

    setHours(newHours);
    patchHours(newHours);
  };

  const updateHourRow = (id: number, field: keyof OperatingHours, val: any) => {
    setHours(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));
  };


  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-12 pb-24 md:pb-12">
      
      {/* ======================= */}
      {/* SECTION 1: MASTER SWITCH */}
      {/* ======================= */}
      <section className="bg-card-bg border border-white/5 rounded-sm p-6 relative overflow-hidden group">
         <div className={`absolute -inset-10 opacity-20 blur-3xl transition-colors duration-1000 z-0 ${settings.is_open ? 'bg-[#34d399]' : 'bg-[#ef4444]'}`}></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div>
             <div className="flex items-center gap-2 mb-2">
                <Power className={settings.is_open ? "text-[#34d399]" : "text-[#ef4444]"} />
                <h2 className="text-2xl font-black text-white">The Big Switch</h2>
             </div>
             <p className="text-white/40 text-sm">
                Master override. Turn this off to strictly reject any incoming traffic irrespective of the standard schedule block.
             </p>
           </div>
           
           <button 
             onClick={handleMasterToggle}
             className={`w-full md:w-64 h-24 rounded-sm flex items-center justify-center border-4 transition-all duration-300 font-black text-xl uppercase tracking-widest ${
               settings.is_open 
                 ? "bg-[#34d399]/20 border-[#34d399] text-[#34d399] shadow-[0_0_30px_rgba(52,211,153,0.3)]" 
                 : "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444] shadow-[0_0_30px_rgba(239,68,68,0.3)]"
             }`}
           >
             {settings.is_open ? "🟢 Store Open" : "🔴 Store Closed"}
           </button>
         </div>

         {!settings.is_open && (
           <div className="relative z-10 mt-6 pt-6 border-t border-white/5 animate-fade-in-up">
             <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50 mb-2 block">
               Closing Reason (Visible to Customers)
             </label>
             <input 
               type="text" 
               value={settings.closed_reason || ""}
               onChange={e => setSettings({...settings, closed_reason: e.target.value})}
               onBlur={() => patchSettings({ closed_reason: settings.closed_reason })}
               placeholder="e.g. Sold out for the day! Back tomorrow."
               className="w-full bg-primary-bg border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-accent-gold focus:outline-none"
             />
             <div className="flex flex-wrap gap-2 mt-3">
               {["Sold out! 🔥", "Rain delay 🌧️", "Closed for holiday"].map(reason => (
                  <button 
                    key={reason}
                    onClick={() => {
                       setSettings({...settings, closed_reason: reason});
                       patchSettings({ closed_reason: reason });
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-3 py-1.5 rounded-sm text-xs transition-colors"
                  >
                    {reason}
                  </button>
               ))}
             </div>
           </div>
         )}
      </section>


      {/* ======================= */}
      {/* SECTION 2 & 3: HOURS     */}
      {/* ======================= */}
      <section className="bg-card-bg border border-white/5 rounded-sm overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Clock className="text-accent-gold" />
             <h2 className="text-lg font-black text-white tracking-wide">Operating Schedule</h2>
           </div>
           <button 
             onClick={() => patchHours(hours)}
             disabled={loading}
             className="bg-accent-gold text-black px-4 py-2 rounded-sm text-xs font-black tracking-widest uppercase hover:bg-white transition-colors flex items-center gap-2"
           >
             <Save size={14} /> Commit Scope
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary-bg">
                <th className="p-4 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">Day</th>
                <th className="p-4 text-[0.65rem] font-bold uppercase tracking-widest text-white/40 text-center">Status</th>
                <th className="p-4 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">Opens</th>
                <th className="p-4 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">Closes</th>
              </tr>
            </thead>
            <tbody>
              {hours.map(row => (
                <tr key={row.id} className={`border-t border-white/5 transition-colors ${row.id === todayIndex ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}>
                  <td className="p-4">
                     <span className={`font-bold ${row.id === todayIndex ? 'text-accent-gold' : 'text-white'}`}>
                        {row.day_name}
                     </span>
                     {row.id === todayIndex && <span className="ml-2 text-[0.55rem] uppercase tracking-widest bg-accent-gold/20 text-accent-gold px-1.5 py-0.5 rounded-sm">Today</span>}
                     {row.id === 1 && (
                        <button onClick={() => handleScheduleToggleAll(row.id)} className="block mt-1 text-[0.55rem] text-white/30 hover:text-white uppercase font-bold tracking-widest">
                           ↳ Copy Mon-Sat
                        </button>
                     )}
                  </td>
                  <td className="p-4 text-center">
                     <button 
                        onClick={() => updateHourRow(row.id, 'is_open', !row.is_open)}
                        className={`relative w-12 h-6 rounded-full transition-colors mx-auto ${row.is_open ? 'bg-[#34d399]' : 'bg-primary-bg border border-white/10'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${row.is_open ? 'bg-black translate-x-6' : 'bg-white/30 translate-x-0'}`} />
                     </button>
                  </td>
                  <td className="p-4">
                     <select 
                       value={row.open_time}
                       onChange={e => updateHourRow(row.id, 'open_time', e.target.value)}
                       className="bg-primary-bg border border-white/10 text-white text-sm rounded-sm px-2 py-1.5 focus:outline-none focus:border-accent-gold"
                     >
                        {TIME_OPTIONS.map(time24 => (
                          <option key={time24} value={time24}>{formatTime24to12(time24)}</option>
                        ))}
                     </select>
                  </td>
                  <td className="p-4">
                      <select 
                       value={row.close_time}
                       onChange={e => updateHourRow(row.id, 'close_time', e.target.value)}
                       className="bg-primary-bg border border-white/10 text-white text-sm rounded-sm px-2 py-1.5 focus:outline-none focus:border-accent-gold"
                     >
                        {TIME_OPTIONS.map(time24 => (
                          <option key={time24} value={time24}>{formatTime24to12(time24)}</option>
                        ))}
                     </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================= */}
      {/* SECTION 4: LOAD PARAMS */}
      {/* ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-card-bg border border-white/5 rounded-sm p-5 space-y-6">
           <div className="flex items-center gap-2 mb-2 pb-5 border-b border-white/5">
             <Settings2 className="text-accent-gold" />
             <h2 className="text-lg font-black text-white tracking-wide">Throughput Params</h2>
           </div>

           <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50 block mb-3">
                 Automated Wait Indication (Minutes)
              </label>
              <div className="flex items-center gap-4">
                 <input 
                   type="range" min="5" max="60" step="5"
                   value={settings.estimated_wait_minutes}
                   onChange={e => setSettings({...settings, estimated_wait_minutes: parseInt(e.target.value)})}
                   onMouseUp={() => patchSettings({ estimated_wait_minutes: settings.estimated_wait_minutes })}
                   className="flex-1 accent-accent-gold"
                 />
                 <span className="text-2xl font-black text-accent-gold w-12">{settings.estimated_wait_minutes}</span>
              </div>
           </div>

           <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50 block mb-2">
                 Max Active Order Saturation Ceiling
              </label>
              <p className="text-[0.65rem] text-white/30 mb-3 leading-relaxed">
                 Public operations suspend automatically upon crossing this concurrency constraint globally.
              </p>
              <input 
                type="number" min="1" max="100"
                value={settings.max_active_orders}
                onChange={e => setSettings({...settings, max_active_orders: parseInt(e.target.value)})}
                onBlur={() => patchSettings({ max_active_orders: settings.max_active_orders })}
                className="w-full bg-primary-bg border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-accent-gold focus:outline-none"
              />
           </div>

           <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50 block mb-1">
                   Enforce Auto-Close Bounds
                </label>
                <p className="text-[0.55rem] text-white/30 leading-relaxed max-w-[200px]">
                   Automatically execute Master Switch off when time exceeds daily closing threshold.
                </p>
              </div>
              <button 
                onClick={() => {
                   const newVal = !settings.auto_close_at_close_time;
                   setSettings({...settings, auto_close_at_close_time: newVal});
                   patchSettings({ auto_close_at_close_time: newVal });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.auto_close_at_close_time ? 'bg-[#34d399]' : 'bg-primary-bg border border-white/10'}`}
              >
                 <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${settings.auto_close_at_close_time ? 'bg-black translate-x-6' : 'bg-white/30 translate-x-0'}`} />
              </button>
           </div>
        </section>

        {/* ======================= */}
        {/* SECTION 5: ANNOUNCEMENTS */}
        {/* ======================= */}
        <section className="bg-card-bg border border-white/5 rounded-sm p-5 space-y-6 flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 mb-5 pb-5 border-b border-white/5">
               <Bell className="text-accent-gold" />
               <h2 className="text-lg font-black text-white tracking-wide">Public Broadcast</h2>
             </div>
             
             <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50 block mb-2">
                Priority Customer Ticker Text
             </label>
             <textarea 
                value={settings.announcement || ""}
                onChange={e => setSettings({...settings, announcement: e.target.value.substring(0, 200)})}
                onBlur={() => patchSettings({ announcement: settings.announcement })}
                placeholder="Pop up a quick note during order drafting. e.g. 🎉 Free extra cheese today!"
                className="w-full bg-primary-bg border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-accent-gold focus:outline-none resize-none h-24"
             />
             <p className="text-[0.6rem] text-right mt-1 font-mono text-white/20">{(settings.announcement?.length || 0)} / 200</p>
           </div>
           
           <div className="pt-4 border-t border-white/5">
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-[#25D366] block mb-2">
                 WhatsApp Configuration Sync
              </label>
              <input 
                type="tel"
                value={settings.whatsapp_number}
                onChange={e => setSettings({...settings, whatsapp_number: e.target.value})}
                onBlur={() => patchSettings({ whatsapp_number: settings.whatsapp_number })}
                className="w-full bg-primary-bg border border-white/10 rounded-sm px-4 py-2 text-white text-sm focus:border-[#25D366] focus:outline-none"
              />
           </div>
        </section>
      </div>

    </div>
  );
}
