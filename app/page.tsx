"use client";

import Hero from "@/components/home/Hero";
import FeaturedMenu from "@/components/home/FeaturedMenu";
import BrandStory from "@/components/home/BrandStory";
import InstagramStrip from "@/components/home/InstagramStrip";
import Contact from "@/components/home/Contact";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="flex flex-col w-full overflow-hidden bg-background">
            <Hero />
            
            {/* ─────────────────── MARQUEE ─────────────────── */}
            <div className="relative bg-accent-gold border-y-2 border-accent-gold/20 py-6 overflow-hidden flex whitespace-nowrap shadow-[0_0_40px_rgba(201,168,76,0.15)] z-20">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-accent-gold to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-accent-gold to-transparent z-10 pointer-events-none" />

                <motion.div
                    animate={{ x: [0, "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
                    className="flex whitespace-nowrap items-center font-black tracking-[4px] text-xl font-display uppercase"
                >
                    {[
                        "LOADED FRIES", "PICK YOUR POISON", "SPICY CHIPOTLE", "TANGY TANDOORI",
                        "CHEEZY GARLIC", "CARTEL SPECIAL", "SURAT'S NO.1 FRIES", "ORDER ONLINE"
                    ].concat([
                        "LOADED FRIES", "PICK YOUR POISON", "SPICY CHIPOTLE", "TANGY TANDOORI",
                        "CHEEZY GARLIC", "CARTEL SPECIAL", "SURAT'S NO.1 FRIES", "ORDER ONLINE"
                    ]).map((item, index) => (
                        <div key={index} className="flex items-center">
                            <span className="mx-8 text-background/90 drop-shadow-sm">{item}</span>
                            <span className="text-background/30 text-2xl">·</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <FeaturedMenu />
            <BrandStory />
            <InstagramStrip />
            <Contact />
        </div>
    );
}
