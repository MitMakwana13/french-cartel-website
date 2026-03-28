"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FeaturedMenu() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
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
                    <p className="text-accent-gold uppercase tracking-[5px] text-xs font-bold mb-4 font-body">The Menu</p>
                    <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter">Pick Your <span className="text-accent-gold italic">Poison</span></h2>
                    <p className="text-foreground/50 mt-4 max-w-md mx-auto font-body text-lg">10 sauces. 10 seasonings. Unlimited wrong choices.</p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                            className="group relative bg-[#151515] border border-white/5 p-8 text-center hover:border-accent-gold/30 hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer overflow-hidden rounded-sm"
                        >
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{flavor.emoji}</div>
                            <h3 className="font-display font-bold text-xl text-foreground group-hover:text-accent-gold transition-colors tracking-wide">{flavor.name}</h3>
                            <p className="text-foreground/40 text-xs mt-2 tracking-[3px] font-bold uppercase">{flavor.desc}</p>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <Link
                        href="/menu"
                        className="inline-block border border-white/20 text-foreground/70 px-10 py-4 uppercase text-sm tracking-[3px] font-bold font-body hover:border-accent-gold hover:text-accent-gold transition-all duration-300 hover:bg-accent-gold/5"
                    >
                        Explore Full Menu
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
