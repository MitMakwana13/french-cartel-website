"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import ParticleCanvas from "@/components/ui/ParticleCanvas";

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
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
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(0,0,0,0.9)_100%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#0f0f0f] via-background/90 to-transparent z-[5]" />
                <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#c9a84c]/10 via-transparent to-transparent z-[6]" />
            </motion.div>

            {/* Noise/texture overlay for grit */}
            <div
                className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
            />

            {/* Gold rising particles */}
            <div className="absolute inset-0 z-[2]">
                <ParticleCanvas />
            </div>

            <motion.div
                style={{ opacity: heroOpacity }}
                className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12"
            >
                {/* Floating EST badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mb-8 inline-flex items-center gap-3 border border-accent-gold/40 bg-accent-gold/[0.06] backdrop-blur-sm px-6 py-2 rounded-full shadow-[0_0_15px_rgba(201,168,76,0.1)]"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                    <span className="tracking-[4px] uppercase text-xs font-bold text-accent-gold/90">EST. 2025 · Surat</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                </motion.div>

                {/* Main headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[clamp(3.5rem,10vw,8.5rem)] font-display font-black tracking-tighter leading-[0.95] mb-8 text-foreground"
                >
                    Surat&apos;s Most{" "}
                    <span className="relative inline-block px-2">
                        <span className="text-accent-gold italic drop-shadow-[0_0_25px_rgba(201,168,76,0.4)]">Wanted</span>
                        <span className="absolute -bottom-1 left-0 w-full h-[4px] bg-accent-gold/60 rounded-full shadow-[0_0_15px_rgba(201,168,76,0.5)]" />
                    </span>{" "}
                    Fries
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                    className="text-[clamp(1.1rem,2.5vw,1.6rem)] text-foreground/80 font-light tracking-wide mb-2 max-w-2xl mx-auto leading-relaxed font-body"
                >
                    Loaded. Sauced. Customized your way.
                </motion.p>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.45 }}
                    className="text-lg md:text-xl font-bold text-accent-gold tracking-[0.2em] uppercase mb-12 drop-shadow-sm"
                >
                    The Cartel Runs Adajan
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl mx-auto"
                >
                    <Link
                        href="/menu"
                        className="group relative w-full sm:w-auto bg-accent-gold text-background px-12 py-5 text-lg font-black uppercase tracking-[3px] overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:shadow-[0_0_40px_rgba(201,168,76,0.6)]"
                    >
                        <span className="relative z-10 font-display">Order Now</span>
                        <span className="absolute inset-0 bg-white translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        <span className="absolute inset-0 z-10 flex items-center justify-center text-background font-display font-black uppercase tracking-[3px] text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                            Order Now
                        </span>
                    </Link>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-foreground/40"
                >
                    <span className="text-[0.65rem] font-bold tracking-[5px] uppercase">Scroll to Explore</span>
                    <ArrowDown className="w-5 h-5 animate-bounce text-accent-gold" />
                </motion.div>
            </motion.div>
        </section>
    );
}
