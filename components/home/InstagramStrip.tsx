"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import Image from "next/image";

export default function InstagramStrip() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-white/5">
            <div className="container mx-auto text-center max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-3 tracking-wider">
                        Follow <span className="text-accent-gold italic">The Cartel</span>
                    </h2>
                    <p className="text-foreground/40 font-body tracking-[4px] text-sm font-bold uppercase">@_frenchcartel</p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 max-w-5xl mx-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.a
                            key={i}
                            href="https://instagram.com/_frenchcartel"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="relative aspect-square overflow-hidden group cursor-pointer block bg-card-bg rounded-sm"
                        >
                            <Image
                                src={`/assets/${i % 2 === 0 ? "truck.png" : "fries.png"}`}
                                alt="Instagram Post"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-75 group-hover:brightness-40 filter grayscale-[20%] group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
                                <Instagram className="text-accent-gold h-10 w-10 mb-2 drop-shadow-md" />
                                <span className="text-foreground font-display tracking-[3px] text-sm uppercase font-bold">View Post</span>
                            </div>
                        </motion.a>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-14"
                >
                    <a
                        href="https://instagram.com/_frenchcartel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 border-2 border-white/10 text-foreground/80 px-10 py-4 uppercase tracking-[4px] text-xs font-black font-body hover:border-accent-gold hover:text-accent-gold transition-all duration-300 hover:bg-accent-gold/5"
                    >
                        <Instagram className="h-5 w-5" />
                        Join The Movement
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
