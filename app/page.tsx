"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram, MapPin, Phone, ArrowDown } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import ParticleCanvas from "@/components/ui/ParticleCanvas";

const marqueeItems = [
    "LOADED FRIES",
    "PICK YOUR POISON",
    "SPICY CHIPOTLE",
    "TANGY TANDOORI",
    "CHEEZY GARLIC",
    "CARTEL SPECIAL",
    "SURAT'S NO.1 FRIES",
    "ORDER ONLINE",
];

export default function Home() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="flex flex-col w-full overflow-hidden">

            {/* ─────────────────── HERO ─────────────────── */}
            <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">

                {/* Parallax Background */}
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    <Image
                        src="/assets/truck.png"
                        alt="French Cartel Food Truck"
                        fill
                        className="object-cover object-center brightness-[0.35] scale-110"
                        priority
                    />
                    {/* Smoke / vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.8)_100%)]" />
                    {/* Gold glow from bottom — mimics warm truck lights */}
                    <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#f5c518]/10 via-transparent to-transparent" />
                </motion.div>

                {/* Noise/texture overlay for grit */}
                <div
                    className="absolute inset-0 z-[1] opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
                />

                {/* Gold rising particles */}
                <ParticleCanvas />

                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-6"
                    >
                        <Image
                            src="/assets/logo.png"
                            alt="French Cartel"
                            width={160}
                            height={160}
                            className="mx-auto object-contain"
                            style={{ filter: "drop-shadow(0 0 40px rgba(245,197,24,0.3))" }}
                            priority
                        />
                    </motion.div>

                    {/* Floating EST badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-8 inline-flex items-center gap-3 border border-accent-gold/40 bg-accent-gold/[0.06] backdrop-blur-sm px-6 py-2 rounded-full"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                        <span className="tracking-[4px] uppercase text-xs font-bold text-accent-gold/90">EST. 2025 · Surat, Gujarat</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[clamp(3rem,10vw,7.5rem)] font-display font-black tracking-tight leading-[1.05] mb-6 drop-shadow-2xl"
                    >
                        Surat&apos;s Most{" "}
                        <span className="relative inline-block">
                            <span className="text-accent-gold italic">Wanted</span>
                            <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-accent-gold/50 rounded-full" />
                        </span>{" "}
                        Fries
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                        className="text-[clamp(1rem,2.5vw,1.4rem)] text-white/80 font-light tracking-wide mb-4 max-w-2xl mx-auto leading-relaxed"
                    >
                        Loaded. Sauced. Customized your way.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.45 }}
                        className="text-lg md:text-xl font-semibold text-accent-gold tracking-widest uppercase mb-12"
                    >
                        The Cartel runs Adajan.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
                    >
                        <Link
                            href="/order"
                            className="group relative w-full sm:w-auto bg-accent-gold text-primary-bg px-10 py-5 text-lg font-black uppercase tracking-[2px] overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-[0_0_30px_rgba(245,197,24,0.35)]"
                        >
                            <span className="relative z-10">Build Your Bowl</span>
                            <span className="absolute inset-0 bg-white translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                            <span className="absolute inset-0 z-10 flex items-center justify-center text-black font-black uppercase tracking-[2px] text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">Build Your Bowl</span>
                        </Link>
                        <Link
                            href="/menu"
                            className="w-full sm:w-auto border-2 border-white/60 text-white px-10 py-5 text-lg font-bold uppercase tracking-[2px] hover:border-accent-gold hover:text-accent-gold transition-all duration-300"
                        >
                            View Menu
                        </Link>
                    </motion.div>

                    {/* Scroll hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
                    >
                        <span className="text-[0.65rem] tracking-[4px] uppercase">Scroll</span>
                        <ArrowDown className="w-4 h-4 animate-bounce" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ─────────────────── MARQUEE ─────────────────── */}
            <div className="relative bg-accent-gold border-y-2 border-accent-gold/20 py-5 overflow-hidden flex whitespace-nowrap shadow-[0_0_40px_rgba(245,197,24,0.15)] z-20">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-accent-gold to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-accent-gold to-transparent z-10 pointer-events-none" />

                <motion.div
                    animate={{ x: [0, "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 22 }}
                    className="flex whitespace-nowrap items-center font-black tracking-[4px] text-xl"
                >
                    {[...marqueeItems, ...marqueeItems].map((item, index) => (
                        <div key={index} className="flex items-center">
                            <span className="mx-6 text-primary-bg/90 drop-shadow-sm">{item}</span>
                            <span className="text-primary-bg/30 text-2xl">·</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ─────────────────── SIGNATURE FLAVORS TEASER ─────────────────── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary-bg relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="text-accent-gold uppercase tracking-[5px] text-xs font-bold mb-4">The Menu</p>
                        <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight">Pick Your <span className="text-accent-gold italic">Poison</span></h2>
                        <p className="text-white/50 mt-4 max-w-md mx-auto">10 sauces. 10 seasonings. Unlimited wrong choices.</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Spicy Chipotle", emoji: "🌶️", desc: "Smoky heat" },
                            { name: "Tangy Tandoori", emoji: "🔥", desc: "Desi fire" },
                            { name: "Cheezy Garlic", emoji: "🧀", desc: "Golden crisp" },
                            { name: "Cartel Special", emoji: "⭐", desc: "Classified" },
                        ].map((flavor, i) => (
                            <motion.div
                                key={flavor.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative bg-card-bg border border-white/5 p-6 md:p-8 text-center hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                <div className="text-4xl mb-3">{flavor.emoji}</div>
                                <h3 className="font-display font-bold text-lg text-white group-hover:text-accent-gold transition-colors">{flavor.name}</h3>
                                <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">{flavor.desc}</p>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <Link
                            href="/menu"
                            className="inline-block border border-white/20 text-white/70 px-8 py-3 uppercase text-sm tracking-[3px] font-bold hover:border-accent-gold hover:text-accent-gold transition-all duration-300"
                        >
                            Explore Full Menu
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─────────────────── BUILD YOUR BOWL BANNER ─────────────────── */}
            <section className="relative py-28 overflow-hidden">
                <div className="absolute inset-0 bg-accent-gold" />
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }}
                />
                <div className="relative z-10 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="uppercase tracking-[5px] text-xs font-bold text-black/50 mb-4">No Two Bowls Alike</p>
                        <h2 className="text-5xl md:text-7xl font-display font-black text-primary-bg tracking-tight mb-6 leading-tight">
                            Build Your<br />Perfect Bowl
                        </h2>
                        <p className="text-black/60 text-lg mb-10 max-w-md mx-auto">Choose your size, sauce, seasoning & add-ons. Live price updates as you build.</p>
                        <Link
                            href="/order"
                            className="inline-block bg-primary-bg text-accent-gold px-12 py-5 text-xl font-black uppercase tracking-[2px] hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                        >
                            Start Building →
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─────────────────── INSTAGRAM FEED ─────────────────── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#060606]">
                <div className="container mx-auto text-center max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-black mb-2 tracking-wide">
                            Follow <span className="text-accent-gold italic">The Cartel</span>
                        </h2>
                        <p className="text-white/40 uppercase tracking-[4px] text-sm">@_frenchcartel</p>
                    </motion.div>

                    <div className="grid grid-cols-3 md:grid-cols-3 gap-1 md:gap-2 max-w-3xl mx-auto">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.a
                                key={i}
                                href="https://instagram.com/_frenchcartel"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                className="relative aspect-square overflow-hidden group cursor-pointer block bg-card-bg"
                            >
                                <Image
                                    src={`/assets/${i % 2 === 0 ? "truck.png" : "fries.png"}`}
                                    alt="Instagram Post"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-50 group-hover:brightness-30"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                    <Instagram className="text-white h-8 w-8 mb-1.5" />
                                    <span className="text-white font-bold tracking-widest text-[0.6rem] uppercase">View Post</span>
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10"
                    >
                        <a
                            href="https://instagram.com/_frenchcartel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 border border-white/15 text-white/70 px-8 py-4 uppercase tracking-[3px] text-sm font-bold hover:border-accent-gold hover:text-accent-gold transition-all duration-300"
                        >
                            <Instagram className="h-4 w-4" />
                            Follow @_frenchcartel
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ─────────────────── CONTACT ─────────────────── */}
            <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-card-bg border-t border-white/5">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="text-accent-gold uppercase tracking-[5px] text-xs font-bold mb-4">Find The Cartel</p>
                        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">Where We Roll</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            {
                                icon: <MapPin className="h-8 w-8 mx-auto text-accent-gold mb-4" />,
                                title: "Location",
                                lines: ["Hazira Rd, near Pal RTO,", "opp. Sangini Aspire, Adajan,", "Surat, Gujarat 394510"],
                            },
                            {
                                icon: <Instagram className="h-8 w-8 mx-auto text-accent-gold mb-4" />,
                                title: "Instagram",
                                lines: ["@_frenchcartel"],
                                link: "https://instagram.com/_frenchcartel",
                            },
                            {
                                icon: <Phone className="h-8 w-8 mx-auto text-accent-gold mb-4" />,
                                title: "WhatsApp",
                                lines: ["Hit us on WhatsApp", "for group / bulk orders"],
                                link: "https://wa.me/919924247897",
                            },
                        ].map((card, i) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group p-8 border border-white/5 hover:border-accent-gold/30 transition-all duration-300"
                            >
                                {card.icon}
                                <h3 className="font-bold uppercase tracking-[3px] text-sm text-white/60 mb-3">{card.title}</h3>
                                {card.lines.map((l, j) =>
                                    card.link && j === 0 ? (
                                        <a key={j} href={card.link} target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-accent-gold transition-colors">{l}</a>
                                    ) : (
                                        <p key={j} className="text-white/50 text-sm leading-relaxed">{l}</p>
                                    )
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center mt-16"
                    >
                        <p className="text-white/30 text-sm tracking-widest uppercase mb-4">Hosting an event?</p>
                        <Link
                            href="/catering"
                            className="inline-block bg-accent-gold text-primary-bg px-10 py-4 font-black uppercase tracking-[2px] text-sm hover:bg-white hover:text-black transition-all duration-300"
                        >
                            Book The Cartel For Your Event
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
