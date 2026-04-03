import { createClient } from "@/lib/supabase/server";
import MenuManagerClient from "@/components/admin/menu/MenuManagerClient";

export default async function AdminMenuPage() {
  const supabase = createClient();
  
  // We don't explicitly check auth because middleware && layout protects this route.
  // We fetch initial menu items server-side strictly ordered by sort_order.
  const { data: menuItems, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  const items = menuItems || [];

  return (
    <div className="w-full h-[calc(100vh-1px)] bg-primary-bg overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="border-b border-white/5 py-4 px-6 md:px-8 bg-card-bg/20 shrink-0">
        <h1 className="font-display italic font-black text-2xl md:text-3xl text-white drop-shadow-md">
          Menu <span className="text-accent-gold">Manager</span>
        </h1>
        <p className="text-white/40 text-xs md:text-sm tracking-wide mt-1">
          Drag to reorder items. Inline edits go live immediately.
        </p>
      </div>

      {/* Interactive Main Payload */}
      <MenuManagerClient initialItems={items} />
    </div>
  );
}
