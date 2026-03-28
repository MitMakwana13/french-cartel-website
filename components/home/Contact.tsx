"use client";

import { motion } from "framer-motion";
import { Instagram, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Contact() {
    return (
        <section id="contact" className="py-32 px-4 sm:px-6 lg:px-8 bg-card-bg border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-gold/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-accent-gold uppercase tracking-[6px] text-xs font-bold mb-5 font-body">Find The Cartel</p>
                    <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground">Where We Roll</h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 text-center">
                    {[
                        {
                            icon: <MapPin className="h-10 w-10 mx-auto text-accent-gold mb-6" />,
                            title: "Location",
                            lines: ["Hazira Rd, near Pal RTO,", "opp. Sangini Aspire, Adajan,", "Surat, Gujarat 394510"],
                        },
                        {
                            icon: <Instagram className="h-10 w-10 mx-auto text-accent-gold mb-6" />,
                            title: "Instagram",
                            lines: ["@_frenchcartel"],
                            link: "https://instagram.com/_frenchcartel",
                        },
                        {
                            icon: <Phone className="h-10 w-10 mx-auto text-accent-gold mb-6" />,
                            title: "WhatsApp",
                            lines: ["Hit us on WhatsApp", "for bulk orders"],
                            link: "https://wa.me/919924247897",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group p-10 bg-background border border-white/5 hover:border-accent-gold/40 transition-all duration-300 relative overflow-hidden rounded-sm hover:-translate-y-2 shadow-xl hover:shadow-[0_20px_40px_rgba(201,168,76,0.1)]"
                        >
                            <div className="relative z-10">
                                {card.icon}
                                <h3 className="font-bold font-body uppercase tracking-[4px] text-xs text-foreground/40 mb-4">{card.title}</h3>
                                {card.lines.map((l, j) =>
                                    card.link && j === 0 ? (
                                        <a key={j} href={card.link} target="_blank" rel="noopener noreferrer" className="block text-foreground hover:text-accent-gold transition-colors font-body text-base font-medium">{l}</a>
                                    ) : (
                                        <p key={j} className="text-foreground/70 text-base leading-relaxed font-body">{l}</p>
                                    )
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-24"
                >
                    <p className="text-foreground/30 text-xs tracking-[5px] uppercase font-bold font-body mb-5">Hosting an event?</p>
                    <Link
                        href="/catering"
                        className="inline-block bg-[#1a1a1a] border border-accent-gold/30 text-accent-gold px-12 py-5 font-black font-display uppercase tracking-[3px] text-sm hover:bg-accent-gold hover:text-background hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all duration-300 rounded-sm"
                    >
                        Book The Cartel For Your Event
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
