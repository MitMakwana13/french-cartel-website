"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-primary-bg overflow-hidden px-4">
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-accent-gold/5 rounded-full blur-[100px] opacity-50"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <h1 className="font-display italic font-black text-4xl text-accent-gold drop-shadow-md">
            French Cartel
          </h1>
          <p className="mt-2 text-white/50 text-[0.65rem] uppercase tracking-[4px] font-bold">
            Command Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="w-full text-center p-3 bg-[#e3342f]/10 border border-[#e3342f]/20 text-[#ff5c5c] text-sm rounded-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-primary-bg border border-white/10 text-white placeholder:text-white/25 placeholder:text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-accent-gold transition-colors duration-300"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-primary-bg border border-white/10 text-white placeholder:text-white/25 placeholder:text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-accent-gold transition-colors duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-accent-gold text-black font-black uppercase tracking-widest text-sm py-4 rounded-sm hover:bg-white hover:text-black transition-colors duration-300 shadow-[0_0_15px_rgba(245,197,24,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-white/30 text-xs hover:text-accent-gold tracking-wide transition-colors duration-300"
          >
            ← Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}
