"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Instagram, ArrowRight } from "lucide-react";

// ─── Animated Counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1500;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
    { emoji: "🍟", value: 10, suffix: "+", label: "Sauce Options" },
    { emoji: "🧂", value: 10, suffix: "", label: "Seasonings" },
    { emoji: "📍", value: 1, suffix: "", label: "Adajan, Surat" },
    { emoji: "⭐", value: 2025, suffix: "", label: "EST." },
];

const STORY_LINES = [
    "French Cartel isn't just a food truck. It's a movement born in the streets of Surat in 2025.",
    "We're a young team obsessed with one thing — giving you the most loaded, most customizable, most unapologetically bold french fries bowl you've ever had.",
    "Parked at Hazira Road, Adajan — our black truck shows up every evening to let you \"Pick Your Poison.\"",
    "10 sauces. 10 seasonings. 4 sizes. Infinite combinations. Your bowl. Your rules.",
];

export default function AboutPage() {
    return (
        <main className="bg-primary-bg min-h-screen pt-20 overflow-x-hidden">

            {/* ── HERO STRIP ── */}
            <div className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,197,24,0.06)_0%,_transparent_65%)] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-accent-gold uppercase tracking-[6px] text-xs font-bold mb-4">Our Story</p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.05] max-w-4xl mx-auto">
                        We Didn&apos;t Start a Business.{" "}
                        <span className="text-accent-gold italic">We Started a Cartel.</span>
                    </h1>
                </motion.div>
            </div>

            {/* ── SPLIT SCREEN ── */}
            <section className="relative px-4 sm:px-6 lg:px-8 pb-0 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT — Story text */}
                    <div className="order-2 lg:order-1">
                        {/* Noise texture strip at top */}
                        <div className="w-12 h-[3px] bg-accent-gold mb-8" />

                        <div className="space-y-6">
                            {STORY_LINES.map((line, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.12 }}
                                    className={`leading-relaxed ${i === 3
                                            ? "text-accent-gold font-bold text-lg tracking-wide"
                                            : "text-white/75 text-lg"
                                        }`}
                                >
                                    {line}
                                </motion.p>
                            ))}

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.55 }}
                                className="text-2xl font-display font-black text-white pt-2"
                            >
                                This is French Cartel.{" "}
                                <span className="text-accent-gold italic">The Cartel runs Surat.</span>
                            </motion.p>
                        </div>

                        {/* Location + IG row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.65 }}
                            className="mt-10 flex flex-col sm:flex-row gap-6"
                        >
                            <a
                                href="https://maps.google.com/?q=Hazira+Rd+Adajan+Surat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 group"
                            >
                                <MapPin className="w-5 h-5 text-accent-gold mt-0.5 shrink-0" />
                                <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                                    Hazira Rd, near Pal RTO,<br />
                                    opp. Sangini Aspire, Adajan,<br />
                                    Surat, Gujarat 394510
                                </p>
                            </a>
                            <a
                                href="https://instagram.com/_frenchcartel"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-accent-gold font-bold hover:text-white transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                                @_frenchcartel
                            </a>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.75 }}
                            className="mt-10"
                        >
                            <Link
                                href="/order"
                                className="inline-flex items-center gap-3 bg-accent-gold text-primary-bg px-8 py-4 font-black uppercase tracking-[2px] text-sm hover:bg-white hover:gap-5 transition-all duration-300"
                            >
                                Build Your Bowl <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* RIGHT — Tilted food truck image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="order-1 lg:order-2 flex justify-center lg:justify-end"
                    >
                        <div className="relative">
                            {/* Outer gold glow ring */}
                            <div className="absolute -inset-3 border border-accent-gold/20 rotate-3 pointer-events-none" />
                            <div className="absolute -inset-6 border border-accent-gold/10 rotate-3 pointer-events-none" />

                            {/* The tilted image */}
                            <div className="relative rotate-3 hover:rotate-0 transition-transform duration-500 shadow-[0_0_60px_rgba(245,197,24,0.15)] border-2 border-accent-gold/40 overflow-hidden">
                                <div className="relative w-[340px] md:w-[420px] h-[460px] md:h-[560px]">
                                    <Image
                                        src="/assets/truck.png"
                                        alt="French Cartel black food truck at night"
                                        fill
                                        className="object-cover brightness-90"
                                    />
                                    {/* Warm bottom glow */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#f5c518]/20 via-transparent to-transparent" />
                                </div>
                            </div>

                            {/* Gold badge overlay */}
                            <div className="absolute -bottom-5 -left-5 bg-accent-gold text-primary-bg px-5 py-3 font-black text-sm uppercase tracking-[2px] rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg">
                                EST. 2025 · Surat
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section className="mt-24 py-16 px-4 bg-card-bg border-y border-white/5 relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(245,197,24,0.03),transparent)] pointer-events-none" />

                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="text-center group"
                        >
                            <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-125">{stat.emoji}</div>
                            <div className="text-4xl md:text-5xl font-display font-black text-accent-gold leading-none mb-2">
                                <Counter target={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-white/40 text-xs uppercase tracking-[3px] font-bold">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── WHAT MAKES US DIFFERENT ── */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-14"
                    >
                        <p className="text-accent-gold uppercase tracking-[5px] text-xs font-bold mb-4">Why The Cartel?</p>
                        <h2 className="text-4xl md:text-5xl font-display font-black">What Makes Us <span className="text-accent-gold italic">Different</span></h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "⚗️",
                                title: "Infinite Combos",
                                desc: "10 sauces × 10 seasonings × 4 sizes = thousands of possible bowls. No two orders need to ever be the same.",
                            },
                            {
                                icon: "🖤",
                                title: "Bold By Design",
                                desc: "We didn't water anything down. Every sauce hits, every seasoning pops. Made for people who actually love flavor.",
                            },
                            {
                                icon: "📱",
                                title: "Order Your Way",
                                desc: "Build your bowl online, pay instantly, pick it up fresh. No waiting, no confusion. Just loaded fries, your way.",
                            },
                        ].map((card, i) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                className="group relative border border-white/5 bg-card-bg p-8 hover:border-accent-gold/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                <div className="text-4xl mb-4">{card.icon}</div>
                                <h3 className="font-display font-black text-xl text-white mb-3 group-hover:text-accent-gold transition-colors">{card.title}</h3>
                                <p className="text-white/50 leading-relaxed text-sm">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <section className="relative py-24 overflow-hidden bg-accent-gold">
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: "repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }}
                />
                <div className="relative z-10 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-display font-black text-primary-bg tracking-tight mb-4">
                            Ready to Join the Cartel?
                        </h2>
                        <p className="text-black/50 mb-10 text-lg">Park yourself at Adajan. Pick your poison. Leave full.</p>
                        <Link
                            href="/order"
                            className="inline-flex items-center gap-3 bg-primary-bg text-accent-gold px-12 py-5 text-lg font-black uppercase tracking-[2px] hover:bg-white hover:text-black transition-all duration-300"
                        >
                            Build Your Bowl <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
