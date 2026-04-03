export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We use a fixed full-screen overlay here with a very high z-index
    // to completely cover the customer Navbar and Footer without breaking the root layout.
    <div className="fixed inset-0 z-[100] bg-primary-bg overflow-y-auto">
      {children}
    </div>
  );
}
