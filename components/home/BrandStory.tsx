"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BrandStory() {
    return (
        <section className="relative py-32 overflow-hidden bg-[#111]">
            <div className="absolute inset-0 bg-background mix-blend-multiply opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.15),_transparent_50%)]" />
            
            {/* Grit texture */}
            <div
                className="absolute inset-0 z-[1] opacity-10 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
            />

            <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col items-center"
                >
                    <p className="uppercase tracking-[6px] text-xs font-bold text-accent-gold mb-8 font-body">No Two Bowls Alike</p>
                    
                    <h2 className="text-5xl md:text-8xl font-display font-black text-foreground tracking-tighter mb-8 leading-[0.9]">
                        Build Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent-gold via-accent-gold to-yellow-700">Perfect Bowl</span>
                    </h2>
                    
                    <div className="space-y-6 text-foreground/70 text-lg md:text-xl font-body max-w-2xl mx-auto leading-relaxed font-light mb-12">
                        <p>
                            We didn&apos;t invent fries, we just perfected the art of loading them.
                            Born on the streets of Surat, French Cartel is an obsession with flavor, 
                            texture, and creating something unforgettably yours.
                        </p>
                        <p>
                            Choose your size. Drown it in our signature sauces. Dust it with our secret seasonings. 
                            Add the crunch, the heat, the gold.
                        </p>
                    </div>

                    <Link
                        href="/order"
                        className="group relative inline-flex items-center justify-center bg-accent-gold text-background px-12 py-5 text-xl font-black uppercase tracking-[3px] font-display hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(201,168,76,0.2)] hover:shadow-[0_0_60px_rgba(201,168,76,0.4)]"
                    >
                        <span className="absolute inset-0 w-0 bg-background transition-all duration-300 ease-out group-hover:w-full z-0" />
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-accent-gold">Start Building →</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
