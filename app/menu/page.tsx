"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const SIZES = [
    { code: "B", name: "Bite", label: "Extra Small", price: 109, desc: "Perfect snack", popular: false },
    { code: "KB", name: "Kilobite", label: "Small", price: 169, desc: "Light hungry", popular: false },
    { code: "MB", name: "MegaBite", label: "Medium", price: 229, desc: "Good choice", popular: true },
    { code: "GB", name: "GigaBite", label: "Large", price: 289, desc: "Go big or go home", popular: false },
];

const FLAVORS = [
    { emoji: "🌶️", name: "Spicy Chipotle", tag: "Must Try", tagColor: "bg-red-500", desc: "Smoky chipotle heat with a deep red kick. Goes hard.", accent: "#ef4444" },
    { emoji: "🍅", name: "Tangy Tandoori", tag: "Must Try", tagColor: "bg-orange-500", desc: "Desi masala vibes — bold, tangy, unforgettable.", accent: "#f97316" },
    { emoji: "🧀", name: "Cheezy Garlic", tag: "Must Try", tagColor: "bg-yellow-500", desc: "Garlic butter + liquid cheese. Pure golden crime.", accent: "#eab308" },
    { emoji: "⭐", name: "Cartel Special", tag: "Chef's Pick", tagColor: "bg-accent-gold", desc: "Our secret blend. Nobody leaves without this.", accent: "#f5c518" },
    { emoji: "🍋", name: "Lemon Pepper", tag: "Fan Fav", tagColor: "bg-lime-500", desc: "Zesty citrus punch with fresh cracked pepper.", accent: "#84cc16" },
    { emoji: "🔥", name: "Korean BBQ", tag: "Trending", tagColor: "bg-pink-500", desc: "Sweet heat with a Seoul-food swagger.", accent: "#ec4899" },
];

const CLASSICS = [
    { name: "Simple Salted", price: 69, note: "The OG" },
    { name: "Peri Peri", price: 89, note: "Light heat" },
    { name: "Xtra Cheese Add-on", price: 30, note: "Level up any order" },
];

const DRINKS = [
    { name: "Diet Coke", price: 40, emoji: "🥤" },
    { name: "Thumbs Up", price: 20, emoji: "🫙" },
    { name: "Maaza", price: 20, emoji: "🥭" },
    { name: "Water", price: 10, emoji: "💧" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
    return {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay },
    };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MenuPage() {
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
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeUp(0)} className="mb-12 text-center">
                        <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">Step 1</p>
                        <h2 className="text-3xl md:text-4xl font-display font-black">Choose Your Size</h2>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {SIZES.map((size, i) => (
                            <motion.div
                                key={size.code}
                                {...fadeUp(i * 0.1)}
                                className="group relative"
                            >
                                {size.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-accent-gold text-primary-bg text-[0.6rem] font-black uppercase tracking-[2px] px-3 py-1 flex items-center gap-1 whitespace-nowrap">
                                        <Star className="w-2.5 h-2.5 fill-current" /> Most Popular
                                    </div>
                                )}
                                <Link href="/order" className="block">
                                    <div className={`relative border p-6 md:p-8 text-center transition-all duration-300 overflow-hidden
                                        ${size.popular
                                            ? "border-accent-gold bg-accent-gold/[0.07] shadow-[0_0_30px_rgba(245,197,24,0.15)]"
                                            : "border-white/8 bg-card-bg hover:border-accent-gold/50 hover:shadow-[0_0_20px_rgba(245,197,24,0.1)] hover:-translate-y-1"
                                        }`}
                                    >
                                        {/* Gold bottom sweep */}
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                                        <span className="text-4xl font-black font-display text-accent-gold/30 leading-none block mb-2">{size.code}</span>
                                        <h3 className="text-2xl font-display font-black text-white mb-1">{size.name}</h3>
                                        <p className="text-white/40 uppercase tracking-[3px] text-[0.65rem] font-bold mb-4">{size.label}</p>
                                        <div className="text-3xl font-black text-accent-gold">₹{size.price}</div>
                                        <p className="text-white/30 text-xs mt-2">{size.desc}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SIGNATURE FLAVORS ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#060606]">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp(0)} className="mb-10 text-center">
                        <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">The Good Stuff</p>
                        <h2 className="text-3xl md:text-4xl font-display font-black">Signature Flavors</h2>
                        <p className="text-white/30 mt-2 text-sm">Mix any 2 sauces + 2 seasonings</p>
                    </motion.div>

                    {/* Horizontal scroll on mobile, grid on desktop */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                        {FLAVORS.map((flavor, i) => (
                            <motion.div
                                key={flavor.name}
                                {...fadeUp(i * 0.1)}
                                className="group relative flex-shrink-0 w-64 md:w-auto border border-white/8 bg-card-bg hover:border-accent-gold/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-300 overflow-hidden cursor-pointer"
                            >
                                {/* Colored top accent bar */}
                                <div className="h-[3px] w-full" style={{ backgroundColor: flavor.accent }} />

                                {/* Image placeholder area with emoji */}
                                <div className="relative h-44 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-[0.04]"
                                        style={{ background: `radial-gradient(circle at center, ${flavor.accent}, transparent 70%)` }}
                                    />
                                    {/* Swap for real food photography when available */}
                                    <div className="relative z-10 text-7xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 select-none">
                                        {flavor.emoji}
                                    </div>
                                    <div className={`absolute top-3 right-3 ${flavor.tagColor} text-black text-[0.6rem] font-black uppercase tracking-[2px] px-2.5 py-1`}>
                                        {flavor.tag}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-display font-black text-xl text-white group-hover:text-accent-gold transition-colors duration-200 mb-2">{flavor.name}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">{flavor.desc}</p>
                                </div>

                                {/* Bottom gold line sweep */}
                                <div className="absolute bottom-0 left-0 w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: flavor.accent }} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CLASSICS ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div {...fadeUp(0)} className="mb-10 text-center">
                        <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">No Frills</p>
                        <h2 className="text-3xl md:text-4xl font-display font-black">The Classics</h2>
                    </motion.div>

                    <div className="space-y-3">
                        {CLASSICS.map((item, i) => (
                            <motion.div
                                key={item.name}
                                {...fadeUp(i * 0.1)}
                                className="group flex items-center justify-between border border-white/5 bg-card-bg px-6 py-5 hover:border-accent-gold/30 hover:bg-accent-gold/5 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-2 h-2 rounded-full bg-accent-gold/30 group-hover:bg-accent-gold transition-colors duration-300" />
                                    <div>
                                        <span className="font-bold text-white group-hover:text-accent-gold transition-colors">{item.name}</span>
                                        <span className="ml-3 text-white/25 text-xs uppercase tracking-[2px]">{item.note}</span>
                                    </div>
                                </div>
                                <span className="font-black text-accent-gold text-lg">₹{item.price}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DIVIDER ── */}
            <div className="h-[1px] w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent my-2" />

            {/* ── DRINKS ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div {...fadeUp(0)} className="mb-10 text-center">
                        <p className="uppercase tracking-[4px] text-xs font-bold text-accent-gold/70 mb-2">Optional Extra</p>
                        <h2 className="text-3xl md:text-4xl font-display font-black">Wash It Down</h2>
                    </motion.div>

                    <motion.div {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-3">
                        {DRINKS.map((drink) => (
                            <div
                                key={drink.name}
                                className="group flex items-center gap-3 border border-white/10 bg-card-bg px-5 py-3 hover:border-accent-gold/50 hover:bg-accent-gold/5 transition-all duration-300 cursor-default"
                            >
                                <span className="text-2xl">{drink.emoji}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-white group-hover:text-accent-gold transition-colors">{drink.name}</span>
                                    <span className="text-accent-gold font-black text-sm">₹{drink.price}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                    <p className="text-center text-white/20 text-xs tracking-widest uppercase mt-6">Add drinks while building your bowl</p>
                </div>
            </section>

            {/* ── ADD-ONS INFO STRIP ── */}
            <section className="py-10 px-4 bg-card-bg border-y border-white/5">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fadeUp(0)} className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center">
                        {[
                            { label: "Extra Cheese", detail: "+ ₹30", emoji: "🧀" },
                            { label: "Nachos Mix", detail: "+ ₹20", emoji: "🫔" },
                            { label: "Kurkure Crunch", detail: "+ ₹15", emoji: "🍿" },
                        ].map((addon) => (
                            <div key={addon.label} className="flex items-center gap-3">
                                <span className="text-2xl">{addon.emoji}</span>
                                <div className="text-left">
                                    <p className="font-bold text-white/80 text-sm">{addon.label}</p>
                                    <p className="text-accent-gold font-black text-xs">{addon.detail}</p>
                                </div>
                            </div>
                        ))}
                        <div className="w-full md:w-auto flex items-center md:ml-4">
                            <p className="text-white/20 text-xs tracking-widest uppercase text-center md:text-left">Add these while customizing your bowl</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <section className="relative py-28 overflow-hidden">
                {/* Gold background with diagonal pattern */}
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
