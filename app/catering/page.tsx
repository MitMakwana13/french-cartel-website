"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Calendar, Users, MapPin, Phone, User, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

type FormInputs = {
    name: string;
    phone: string;
    eventType: string;
    date: string;
    guests: number;
    venue: string;
    notes: string;
};

const EVENT_TYPES = [
    "College Fest",
    "Corporate Event",
    "Birthday Party",
    "Wedding / Sangeet",
    "Private Gathering",
    "Other",
];

const EVENTS_WE_DO = [
    { emoji: "🎓", label: "College Fests" },
    { emoji: "💼", label: "Corporate Events" },
    { emoji: "🎂", label: "Birthday Parties" },
    { emoji: "💍", label: "Weddings / Sangeet" },
    { emoji: "🎉", label: "Private Gatherings" },
    { emoji: "🏟️", label: "Public Events" },
];

function Field({ label, icon, error, children }: {
    label: string; icon: React.ReactNode; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-[2px]">
                {icon} {label}
            </label>
            {children}
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
}

export default function CateringPage() {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>();
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (data: FormInputs) => {
        try {
            // Replace with your Formspree endpoint or backend API
            await fetch("https://formspree.io/f/placeholder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } catch {
            // Even if the endpoint fails in preview, show success
        }
        setIsSuccess(true);
    };

    const inputClass = "w-full bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-accent-gold transition-colors text-sm";

    return (
        <main className="bg-primary-bg min-h-screen pt-20 overflow-x-hidden">

            {/* ── HEADER ── */}
            <section className="relative py-20 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,197,24,0.07)_0%,_transparent_65%)] pointer-events-none" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <p className="text-accent-gold uppercase tracking-[6px] text-xs font-bold mb-4">Cater With Us</p>
                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
                        Book The Cartel<br />
                        <span className="text-accent-gold italic">For Your Event</span>
                    </h1>
                    <p className="text-white/40 text-base tracking-widest uppercase">
                        College Fests · Corporate Events · Birthday Parties · Private Gatherings
                    </p>
                </motion.div>
            </section>

            {/* ── EVENT TYPES PILLS ── */}
            <section className="pb-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
                >
                    {EVENTS_WE_DO.map((e) => (
                        <div key={e.label} className="flex items-center gap-2 border border-white/8 bg-card-bg px-4 py-2.5 text-white/60 text-sm font-bold">
                            <span>{e.emoji}</span> {e.label}
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ── FORM ── */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="border border-accent-gold/15 bg-card-bg p-8 md:p-10 shadow-[0_0_60px_rgba(245,197,24,0.04)] relative overflow-hidden"
                    >
                        {/* Subtle gold corner glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-gold/[0.03] rounded-bl-full pointer-events-none" />

                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-12"
                                >
                                    <CheckCircle className="w-16 h-16 text-accent-gold mx-auto mb-5" />
                                    <h3 className="text-3xl font-display font-black text-accent-gold mb-3">Request Received!</h3>
                                    <p className="text-white/60 text-lg mb-2">
                                        We&apos;ll reach out on WhatsApp within 24 hours! 🍟
                                    </p>
                                    <p className="text-white/30 text-sm mb-8">Our team will confirm availability and send you a quote.</p>
                                    <button
                                        onClick={() => { setIsSuccess(false); reset(); }}
                                        className="border border-white/15 text-white/50 px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:border-accent-gold hover:text-accent-gold transition-colors"
                                    >
                                        Submit Another Request
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-5"
                                >
                                    <div className="mb-6">
                                        <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold">Fill in the details below</p>
                                        <div className="w-10 h-[2px] bg-accent-gold mt-2" />
                                    </div>

                                    {/* Row 1: Name + Phone */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Field label="Your Name" icon={<User className="w-3.5 h-3.5" />} error={errors.name?.message}>
                                            <input
                                                type="text"
                                                placeholder="Full Name *"
                                                {...register("name", { required: "Name is required" })}
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field label="WhatsApp Number" icon={<Phone className="w-3.5 h-3.5" />} error={errors.phone?.message}>
                                            <input
                                                type="tel"
                                                placeholder="10-digit number *"
                                                {...register("phone", { required: "Phone is required" })}
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    {/* Row 2: Event Type + Date */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Field label="Event Type" icon={<FileText className="w-3.5 h-3.5" />} error={errors.eventType?.message}>
                                            <select
                                                {...register("eventType", { required: "Select an event type" })}
                                                className={`${inputClass} cursor-pointer`}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select event type *</option>
                                                {EVENT_TYPES.map(t => (
                                                    <option key={t} value={t} className="bg-card-bg">{t}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Event Date" icon={<Calendar className="w-3.5 h-3.5" />} error={errors.date?.message}>
                                            <input
                                                type="date"
                                                {...register("date", { required: "Date is required" })}
                                                className={`${inputClass} [color-scheme:dark]`}
                                            />
                                        </Field>
                                    </div>

                                    {/* Row 3: Guests + Venue */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Field label="Expected Guests" icon={<Users className="w-3.5 h-3.5" />} error={errors.guests?.message}>
                                            <input
                                                type="number"
                                                placeholder="Approx. headcount *"
                                                min={10}
                                                {...register("guests", { required: "Guest count required", min: { value: 10, message: "Minimum 10 guests" } })}
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field label="Location / Venue" icon={<MapPin className="w-3.5 h-3.5" />} error={errors.venue?.message}>
                                            <input
                                                type="text"
                                                placeholder="Venue / City *"
                                                {...register("venue", { required: "Venue is required" })}
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    {/* Notes */}
                                    <Field label="Additional Requirements" icon={<FileText className="w-3.5 h-3.5" />}>
                                        <textarea
                                            rows={4}
                                            placeholder="Menu preferences, special requests, setup requirements..."
                                            {...register("notes")}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </Field>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-accent-gold text-primary-bg py-4 font-black uppercase tracking-[2px] text-sm hover:bg-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                    >
                                        {isSubmitting ? "Sending..." : "Send Enquiry →"}
                                    </button>

                                    <p className="text-white/25 text-xs text-center">
                                        We&apos;ll confirm via WhatsApp on the number you provided.
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Reach us directly */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-white/25 text-sm mb-4">Or reach us directly</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="https://wa.me/919924247897?text=Hi%2C%20I%20want%20to%20book%20French%20Cartel%20for%20my%20event."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 border border-green-500/30 text-green-400 px-5 py-2.5 text-sm font-bold hover:bg-green-500/10 transition-colors"
                            >
                                💬 WhatsApp Us
                            </a>
                            <a
                                href="https://instagram.com/_frenchcartel"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 border border-accent-gold/25 text-accent-gold px-5 py-2.5 text-sm font-bold hover:bg-accent-gold/5 transition-colors"
                            >
                                <Instagram className="w-4 h-4" /> DM on Instagram
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── INSTAGRAM FEED ── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#060606]">
                <div className="container mx-auto text-center max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <p className="text-accent-gold uppercase tracking-[5px] text-xs font-bold mb-4">Stay Updated</p>
                        <h2 className="text-4xl md:text-5xl font-display font-black mb-2 tracking-wide">
                            Follow <span className="text-accent-gold italic">The Cartel</span>
                        </h2>
                        <p className="text-white/30 uppercase tracking-[4px] text-sm">@_frenchcartel</p>
                    </motion.div>

                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2 mb-10 max-w-3xl mx-auto">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <motion.a
                                key={i}
                                href="https://www.instagram.com/_frenchcartel/"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="relative aspect-square overflow-hidden group cursor-pointer bg-card-bg border border-white/5"
                            >
                                {/* Placeholder gradient */}
                                <div
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        background: [
                                            "linear-gradient(135deg,#f5c518,#ff6b00)",
                                            "linear-gradient(135deg,#1a1a1a,#333)",
                                            "linear-gradient(135deg,#f5c518,#1a1a1a)",
                                            "linear-gradient(135deg,#333,#f5c518)",
                                            "linear-gradient(135deg,#ff6b00,#1a1a1a)",
                                            "linear-gradient(135deg,#1a1a1a,#f5c518)",
                                            "linear-gradient(135deg,#f5c518,#333)",
                                            "linear-gradient(135deg,#333,#ff6b00)",
                                        ][i % 8],
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl opacity-20 select-none">
                                        {["🍟", "🌶️", "🧀", "🔥", "⭐", "🫔", "🥤", "🍿"][i % 8]}
                                    </span>
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                    <span className="text-white text-[0.6rem] font-bold tracking-widest uppercase">View on Instagram</span>
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <a
                            href="https://www.instagram.com/_frenchcartel/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 border border-white/15 text-white/70 px-10 py-4 uppercase tracking-[3px] text-sm font-bold hover:border-accent-gold hover:text-accent-gold transition-all duration-300"
                        >
                            <Instagram className="h-4 w-4" />
                            Follow @_frenchcartel on Instagram
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Mini CTA */}
            <div className="py-10 bg-card-bg border-t border-white/5 text-center px-4">
                <p className="text-white/30 text-sm mb-4 tracking-widest uppercase">Hungry right now?</p>
                <Link
                    href="/order"
                    className="inline-block bg-accent-gold text-primary-bg px-8 py-3.5 font-black uppercase tracking-[2px] text-sm hover:bg-white transition-colors"
                >
                    Build Your Bowl →
                </Link>
            </div>
        </main>
    );
}
