import BowlBuilder from "@/components/wizard/BowlBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Build Your Bowl | French Cartel",
    description: "Customize your loaded fries bowl — 4 sizes, 10 sauces, 10 seasonings. Online payment only. Order in Surat.",
};

export default function OrderPage() {
    return (
        <main className="bg-primary-bg min-h-screen">
            {/* Header */}
            <div className="relative pt-32 pb-14 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,197,24,0.07)_0%,_transparent_65%)] pointer-events-none" />
                <p className="text-accent-gold uppercase tracking-[6px] text-xs font-bold mb-4">Step by Step</p>
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none mb-3">
                    Build Your <span className="text-accent-gold italic">Bowl</span>
                </h1>
                <p className="text-white/30 tracking-[3px] uppercase text-sm font-bold">Your Bowl. Your Rules.</p>

                {/* Inline no-COD badge */}
                <div className="mt-6 inline-flex items-center gap-2 border border-[#E3342F]/30 bg-[#E3342F]/10 px-4 py-2 text-[#ff5c5c] text-xs font-black uppercase tracking-[2px]">
                    ⚡ Online Payment Only — No Cash on Delivery
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 pb-8">
                <BowlBuilder />
            </div>
        </main>
    );
}
