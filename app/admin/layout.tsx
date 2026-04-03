import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import QuickStockFAB from "@/components/admin/QuickStockPanel";

export const metadata = {
  title: "Admin | French Cartel",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  // Fetch user server-side.
  // Note: Middleware already protects routes and redirects to /admin/login if not auth'd.
  const { data: { user } } = await supabase.auth.getUser();

  return (
    // We use a high z-index fixed container to overlay the customer Navbar/Footer that wrap the root app layout
    <div className="fixed inset-0 z-[60] bg-primary-bg flex flex-col md:flex-row overflow-hidden">
      {/* 
        Only render the sidebar if authenticated.
        This elegantly prevents the sidebar from rendering "underneath" the /admin/login page layer.
      */}
      {user && <AdminSidebar />}
      
      {/* 
        Main content area 
        Added pb-20 on mobile to account for the fixed bottom tab bar!
      */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative w-full h-full">
        {children}
      </main>
      {user && <QuickStockFAB />}
    </div>
  );
}
