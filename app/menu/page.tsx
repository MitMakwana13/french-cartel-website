"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Clock } from "lucide-react";
import type { MenuItem } from "@/lib/supabase/types";
import { isItemAvailable, getLabelColor } from "@/lib/menu-availability";

// ─── Helpers ────────────────────────────────────────────────────────────────
function fadeUp(delay = 0) {
    return {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay },
    };
}

const ACCENTS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#ec4899", "#38bdf8"];

// ─── Page ───────────────────────────────────────────────────────────────────
export default function MenuPage() {
    const [sizes, setSizes] = useState<MenuItem[]>([]);
    const [sauces, setSauces] = useState<MenuItem[]>([]);
    const [seasonings, setSeasonings] = useState<MenuItem[]>([]);
    const [addons, setAddons] = useState<MenuItem[]>([]);
    const [drinks, setDrinks] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMenu() {
            try {
                const res = await fetch('/api/menu');
                const { data } = await res.json();
                
                if (data) {
                    const items: (MenuItem & { availability?: any })[] = data.map((i: MenuItem) => ({
                        ...i,
                        availability: isItemAvailable(i)
                    }));
                    setSizes(items.filter(i => i.category === 'size'));
                    setSauces(items.filter(i => i.category === 'sauce'));
                    setSeasonings(items.filter(i => i.category === 'seasoning'));
                    setAddons(items.filter(i => i.category === 'addon'));
                    setDrinks(items.filter(i => i.category === 'drink'));
                }
            } catch (err) {
                console.error("Failed fetching menu dynamically:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMenu();
    }, []);

    const ACCENT_COLORS = ["#ef4444", "#f97316", "#eab308", "#f5c518", "#84cc16", "#ec4899"];

    if (loading) {
       return (
          <div className="bg-primary-bg min-h-screen pt-40 px-4 flex justify-center">
             <span className="w-10 h-10 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin"></span>
          </div>
       );
    }

    return (
        <main className="bg-primary-bg min-h-screen pt-20 overflow-x-hidden">

            {/* ── PAGE HEADER ── */}
            <section className="relative py-20 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,197,24,0.08)_0%,_transparent_70%)] pointer-events-none" />
                <motion.div {...fadeUp(0)}>
                    <p className="text-accent-gold uppercase tracking-[6px] text-xs font-bold mb-4">French Cartel · Surat</p>
                    <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight leading-none mb-4">
                        The <span className="text-accent-gold italic">Menu</span>
                    </h1>
                    <p className="text-white/40 text-xl tracking-widest uppercase mt-4">Pick Your Poison</p>
                </motion.div>
            </section>

            {/* ── SIZES ── */}
            {sizes.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <motion.div {...fadeUp(0)} className="mb-12 text-center">
                            <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">Step 1</p>
                            <h2 className="text-3xl md:text-4xl font-display font-black">Choose Your Size</h2>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                             {sizes.map((size: any, i) => {
                                const av = size.availability;
                                const isNotAv = !av.available;
                                const badgeText = av.label;
                                const badgeColor = av.labelColor || 'text-primary-bg bg-accent-gold';

                                return (
                                <motion.div
                                    key={size.id}
                                    {...fadeUp(i * 0.1)}
                                    className={`group relative ${isNotAv ? 'opacity-70' : ''}`}
                                >
                                    {badgeText && (
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[0.6rem] font-black uppercase tracking-[2px] px-3 py-1 flex items-center gap-1 whitespace-nowrap shadow-md border border-white/10 ${badgeColor}`}>
                                            {badgeText === 'Popular' && <Star className="w-2.5 h-2.5 fill-current" />}
                                            {badgeText}
                                        </div>
                                    )}
                                    {size.is_popular && !badgeText && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-accent-gold text-primary-bg text-[0.6rem] font-black uppercase tracking-[2px] px-3 py-1 flex items-center gap-1 whitespace-nowrap">
                                            <Star className="w-2.5 h-2.5 fill-current" /> Most Popular
                                        </div>
                                    )}
                                    <Link href="/order" className={`block h-full ${isNotAv ? 'cursor-not-allowed pointer-events-none' : ''}`}>
                                        <div className={`relative border p-6 md:p-8 text-center transition-all duration-300 overflow-hidden h-full flex flex-col items-center justify-center
                                            ${isNotAv 
                                                ? "border-white/5 bg-white/[0.02]"
                                                : size.is_popular
                                                ? "border-accent-gold bg-accent-gold/[0.07] shadow-[0_0_30px_rgba(245,197,24,0.15)]"
                                                : "border-white/8 bg-card-bg hover:border-accent-gold/50 hover:shadow-[0_0_20px_rgba(245,197,24,0.1)] hover:-translate-y-1"
                                            }`}
                                        >
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                                            {isNotAv && (
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-20 px-4">
                                                    <span className="text-[#ef4444] text-[0.7rem] font-black uppercase tracking-[2px] leading-tight text-center">
                                                        {av.reason || 'Sold Out'}
                                                    </span>
                                                </div>
                                            )}

                                            {size.code && <span className="text-4xl font-black font-display text-accent-gold/30 leading-none block mb-2">{size.code}</span>}
                                            <h3 className="text-2xl font-display font-black text-white mb-1">{size.name}</h3>
                                            <p className="text-white/40 uppercase tracking-[3px] text-[0.65rem] font-bold mb-4">{size.label || 'Standard'}</p>
                                            <div className="text-3xl font-black text-accent-gold">₹{size.price}</div>
                                            {size.description && <p className="text-white/30 text-xs mt-3 flex-1">{size.description}</p>}
                                        </div>
                                    </Link>
                                </motion.div>
                            )})}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SAUCES ── */}
            {sauces.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#060606]">
                    <div className="max-w-7xl mx-auto">
                        <motion.div {...fadeUp(0)} className="mb-10 text-center">
                            <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">The Good Stuff</p>
                            <h2 className="text-3xl md:text-4xl font-display font-black">Signature Sauces</h2>
                            <p className="text-white/30 mt-2 text-sm">Mix any 2 sauces freely</p>
                        </motion.div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                            {sauces.map((sauce: any, i) => {
                                const av = sauce.availability;
                                const isNotAv = !av.available;
                                const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                                const badgeText = av.label;
                                const badgeColor = av.labelColor || 'text-white bg-white/10 border-white/20';

                                return (
                                <motion.div
                                    key={sauce.id}
                                    {...fadeUp(i * 0.1)}
                                    className={`group relative flex-shrink-0 w-64 md:w-auto border border-white/8 bg-card-bg hover:border-accent-gold/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-300 overflow-hidden ${isNotAv ? 'cursor-not-allowed grayscale-[0.8]' : 'cursor-pointer'}`}
                                >
                                    <div className="h-[3px] w-full" style={{ backgroundColor: isNotAv ? '#444' : accent }} />

                                    <div className="relative h-32 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                                        {!isNotAv && (
                                            <div className="absolute inset-0 opacity-[0.04]" style={{ background: `radial-gradient(circle at center, ${accent}, transparent 70%)` }} />
                                        )}
                                        {isNotAv && (
                                            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center px-4">
                                                <span className="text-[#ef4444] text-[0.65rem] font-black uppercase tracking-[2.5px] text-center leading-tight">
                                                    {av.reason || 'Sold Out'}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`relative z-10 text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 select-none ${isNotAv ? 'opacity-20' : ''}`}>
                                            {sauce.emoji || '🔥'}
                                        </div>
                                        {!isNotAv && badgeText && (
                                            <div className={`absolute top-3 right-3 text-[0.55rem] font-black uppercase tracking-widest px-2 py-0.5 border z-20 ${badgeColor}`}>
                                                {badgeText}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-display font-black text-xl text-white group-hover:text-accent-gold transition-colors duration-200 mb-2">{sauce.name}</h3>
                                        {sauce.description && <p className="text-white/40 text-sm leading-relaxed">{sauce.description}</p>}
                                    </div>
                                    {!isNotAv && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: accent }} />
                                    )}
                                </motion.div>
                            )})}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SEASONINGS ── */}
            {seasonings.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.div {...fadeUp(0)} className="mb-10 text-center">
                            <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">No Frills</p>
                            <h2 className="text-3xl md:text-4xl font-display font-black">Raw Seasonings</h2>
                            <p className="text-white/30 mt-2 text-sm">Pick up to 2 dustings</p>
                        </motion.div>

                        <div className="space-y-3">
                            {seasonings.map((item: any, i) => {
                                const av = item.availability;
                                const isNotAv = !av.available;
                                return (
                                <motion.div
                                    key={item.id}
                                    {...fadeUp(i * 0.1)}
                                    className={`group flex items-center justify-between border px-6 py-5 transition-all duration-300 relative
                                        ${isNotAv 
                                            ? "border-white/5 bg-white/[0.02] opacity-60" 
                                            : "border-white/5 bg-card-bg hover:border-accent-gold/30 hover:bg-accent-gold/5"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {item.emoji ? (
                                            <span className={`text-xl ${isNotAv ? 'grayscale opacity-30' : ''}`}>{item.emoji}</span>
                                        ) : (
                                        <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isNotAv ? 'bg-white/10' : 'bg-accent-gold/30 group-hover:bg-accent-gold'}`} />
                                        )}
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold transition-colors ${isNotAv ? 'text-white/20 line-through' : 'text-white group-hover:text-accent-gold'}`}>{item.name}</span>
                                                {!isNotAv && av.label && (
                                                    <span className={`text-[0.55rem] font-black uppercase tracking-widest px-2 py-0.5 border ${av.labelColor || 'text-white/40 border-white/10'}`}>
                                                        {av.label}
                                                    </span>
                                                )}
                                            </div>
                                            {item.description && <span className="text-white/25 text-xs uppercase tracking-[2px] hidden sm:inline">{item.description}</span>}
                                        </div>
                                    </div>
                                    {isNotAv && (
                                        <span className="text-[#ef4444] text-[0.6rem] font-black uppercase tracking-[2px] border border-[#ef4444]/20 px-2 py-1 bg-[#ef4444]/5">
                                            {av.reason || 'Sold Out'}
                                        </span>
                                    )}
                                    {!isNotAv && <span className="font-black text-accent-gold text-lg">Included</span>}
                                </motion.div>
                            )})}
                        </div>
                    </div>
                </section>
            )}

            {/* ── DIVIDER ── */}
            <div className="h-[1px] w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent my-2" />

            {/* ── ADD-ONS INFO STRIP ── */}
            {addons.length > 0 && (
                <section className="py-16 px-4 bg-card-bg border-y border-white/5">
                    <div className="max-w-5xl mx-auto">
                        <motion.div {...fadeUp(0)} className="mb-10 text-center">
                            <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">Addons</p>
                            <h2 className="text-3xl md:text-4xl font-display font-black">Make it Elite</h2>
                        </motion.div>

                        <motion.div {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-center">
                            {addons.map((addon: any) => {
                                const av = addon.availability;
                                const isNotAv = !av.available;
                                return (
                                <div key={addon.id} className={`flex items-center gap-3 bg-primary-bg px-5 py-3 border rounded-sm relative ${isNotAv ? 'opacity-40 border-white/5 grayscale' : 'border-white/10'}`}>
                                    {addon.emoji && <span className={`text-2xl ${isNotAv ? 'opacity-20' : ''}`}>{addon.emoji}</span>}
                                    <div className="text-left">
                                        <p className={`font-bold text-sm ${isNotAv ? 'text-white/20 line-through' : 'text-white/80'}`}>{addon.name}</p>
                                        {isNotAv && <p className="text-[#ef4444] font-black text-[0.6rem] uppercase tracking-wider">{av.reason || 'Sold Out'}</p>}
                                        {!isNotAv && (
                                            <div className="flex items-center gap-2">
                                                <p className="text-accent-gold font-black text-xs">+ ₹{addon.price}</p>
                                                {av.label && <span className={`text-[0.5rem] font-black uppercase tracking-tighter px-1.5 py-0.5 border ${av.labelColor || 'border-white/10 text-white/30'}`}>{av.label}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ── DRINKS ── */}
            {drinks.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.div {...fadeUp(0)} className="mb-10 text-center">
                            <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">Quench Thirst</p>
                            <h2 className="text-3xl md:text-4xl font-display font-black">Wash It Down</h2>
                        </motion.div>

                        <motion.div {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-3">
                            {drinks.map((drink: any) => {
                                const av = drink.availability;
                                const isNotAv = !av.available;
                                return (
                                <div
                                    key={drink.id}
                                    className={`group flex items-center gap-3 border bg-card-bg px-5 py-3 transition-all duration-300 cursor-default relative ${isNotAv ? 'border-white/5 opacity-40 grayscale' : 'border-white/10 hover:border-accent-gold/50 hover:bg-accent-gold/5'}`}
                                >
                                    {drink.emoji && <span className={`text-2xl ${isNotAv ? 'opacity-20' : ''}`}>{drink.emoji}</span>}
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`font-bold transition-colors ${isNotAv ? 'text-white/20 line-through' : 'text-white group-hover:text-accent-gold'}`}>{drink.name}</span>
                                            {!isNotAv && <span className="text-accent-gold font-black text-sm">₹{drink.price}</span>}
                                        </div>
                                        {isNotAv && <span className="text-[#ef4444] text-[0.6rem] font-black uppercase tracking-[2px] leading-tight">{av.reason || 'Sold Out'}</span>}
                                        {!isNotAv && av.label && (
                                            <span className={`text-[0.5rem] font-black uppercase tracking-[1px] px-1.5 py-0.5 border mt-1 ${av.labelColor || 'border-white/10 text-white/30'}`}>
                                                {av.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ── BOTTOM CTA ── */}
            <section className="relative py-28 overflow-hidden mt-10">
                <div className="absolute inset-0 bg-accent-gold" />
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
                        backgroundSize: "10px 10px",
                    }}
                />

                <div className="relative z-10 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="uppercase tracking-[5px] text-xs font-bold text-black/40 mb-4">Customize. Click. Done.</p>
                        <h2 className="text-5xl md:text-7xl font-display font-black text-primary-bg tracking-tight mb-3 leading-tight">
                            Want It<br />Your Way?
                        </h2>
                        <p className="text-black/50 text-lg mb-10">Choose your size, sauce, seasoning & add-ons — live price updates as you build.</p>
                        <Link
                            href="/order"
                            className="inline-flex items-center gap-3 bg-primary-bg text-accent-gold px-12 py-5 text-lg font-black uppercase tracking-[2px] hover:bg-white hover:text-black hover:gap-5 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                        >
                            Build Your Bowl <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

        </main>
    );
}
