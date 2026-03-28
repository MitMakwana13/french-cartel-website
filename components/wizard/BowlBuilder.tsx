"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, ShoppingBag, Lock, Zap, Star } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// ─── Types ──────────────────────────────────────────────────────────────────
type Size = { id: string; code: string; name: string; label: string; price: number };
type Addon = { id: string; name: string; price: number; emoji: string };

// ─── Data ───────────────────────────────────────────────────────────────────
const SIZES: Size[] = [
    { id: "bite", code: "B", name: "Bite", label: "Extra Small", price: 109 },
    { id: "kilobite", code: "KB", name: "Kilobite", label: "Small", price: 169 },
    { id: "megabite", code: "MB", name: "MegaBite", label: "Medium", price: 229 },
    { id: "gigabite", code: "GB", name: "GigaBite", label: "Large", price: 289 },
];

const SAUCES = [
    "Rich & Creamy", "Tandoori", "Spicy Garlic", "Korean BBQ",
    "Cheesy Spread", "Chipotle", "Tomato Ketchup", "Cheese & Jalapeño",
    "Spicy Momo", "Peri Peri",
];

const SEASONINGS = [
    "All Purpose", "Pizza Pasta", "Garlic Powder", "Herby Italian",
    "Taco", "Cajun Spice", "Cheese & Herb", "Lemon Pepper",
    "Garlic Bread", "Onion Powder",
];

const ADDONS: Addon[] = [
    { id: "cheese", name: "Extra Cheese", price: 30, emoji: "🧀" },
    { id: "nachos", name: "Nachos", price: 20, emoji: "🫔" },
    { id: "kurkure", name: "Kurkure", price: 15, emoji: "🍿" },
];

const DRINKS: Addon[] = [
    { id: "diet_coke", name: "Diet Coke", price: 40, emoji: "🥤" },
    { id: "thumbs_up", name: "Thumbs Up", price: 20, emoji: "🫙" },
    { id: "maaza", name: "Maaza", price: 20, emoji: "🥭" },
    { id: "water", name: "Water", price: 10, emoji: "💧" },
];

const STEPS = [
    { label: "Size", short: "S" },
    { label: "Sauce", short: "S" },
    { label: "Seasoning", short: "S" },
    { label: "Add-ons", short: "A" },
    { label: "Drinks", short: "D" },
    { label: "Checkout", short: "C" },
];

// ─── Helper: chip button ─────────────────────────────────────────────────────
function Chip({ label, selected, onClick, disabled }: {
    label: string; selected: boolean; onClick: () => void; disabled: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled && !selected}
            className={`relative flex items-center gap-2 px-4 py-3 border text-sm font-bold tracking-wide transition-all duration-200
                ${selected
                    ? "border-accent-gold bg-accent-gold text-primary-bg shadow-[0_0_12px_rgba(245,197,24,0.4)]"
                    : "border-white/10 bg-card-bg text-white/80 hover:border-white/30"
                }
                ${disabled && !selected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {selected && <Check className="w-3 h-3 shrink-0" />}
            {label}
        </button>
    );
}

// ─── Helper: section heading ─────────────────────────────────────────────────
function StepHeading({ label, sub }: { label: string; sub?: string }) {
    return (
        <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white">{label}</h2>
            {sub && <p className="text-white/40 text-sm uppercase tracking-[3px] mt-1">{sub}</p>}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BowlBuilder() {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
    const [selectedSeasonings, setSelectedSeasonings] = useState<string[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
    const [selectedDrinks, setSelectedDrinks] = useState<Addon[]>([]);
    const { showToast } = useToast();
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [instructions, setInstructions] = useState("");

    // Live price
    const totalPrice = useMemo(() => {
        let t = selectedSize?.price ?? 0;
        selectedAddons.forEach(a => (t += a.price));
        selectedDrinks.forEach(d => (t += d.price));
        return t;
    }, [selectedSize, selectedAddons, selectedDrinks]);

    // Toggle helpers
    function toggleSauce(s: string) {
        setSelectedSauces(prev => {
            if (prev.includes(s)) return prev.filter(x => x !== s);
            if (prev.length >= 2) { showToast("Max 2 sauces allowed! 🌶️"); return prev; }
            return [...prev, s];
        });
    }
    function toggleSeasoning(s: string) {
        setSelectedSeasonings(prev => {
            if (prev.includes(s)) return prev.filter(x => x !== s);
            if (prev.length >= 2) { showToast("Max 2 seasonings allowed! 🧂"); return prev; }
            return [...prev, s];
        });
    }
    function toggleAddon(a: Addon) {
        setSelectedAddons(prev =>
            prev.find(x => x.id === a.id) ? prev.filter(x => x.id !== a.id) : [...prev, a]
        );
    }
    function toggleDrink(d: Addon) {
        setSelectedDrinks(prev =>
            prev.find(x => x.id === d.id) ? prev.filter(x => x.id !== d.id) : [...prev, d]
        );
    }

    // Next allowed?
    const canNext =
        step === 1 ? !!selectedSize :
            step === 6 ? !!(customerName && customerPhone) :
                true;

    // Razorpay checkout
    async function handleCheckout(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedSize || !customerName || !customerPhone) return;

        const loadScript = () =>
            new Promise<boolean>(resolve => {
                if (document.getElementById("rzp-script")) { resolve(true); return; }
                const s = document.createElement("script");
                s.id = "rzp-script";
                s.src = "https://checkout.razorpay.com/v1/checkout.js";
                s.onload = () => resolve(true);
                s.onerror = () => resolve(false);
                document.body.appendChild(s);
            });

        const ok = await loadScript();
        if (!ok) { alert("Payment SDK failed to load. Please try again."); return; }

        const orderText =
            `*🍟 NEW ORDER — FRENCH CARTEL*\n\n` +
            `*Name:* ${customerName}\n*WhatsApp:* ${customerPhone}\n` +
            `*Order Type:* 🏪 Pickup\n\n` +
            `*Size:* ${selectedSize.name} (${selectedSize.code})\n` +
            `*Sauces:* ${selectedSauces.join(", ") || "None"}\n` +
            `*Seasoning:* ${selectedSeasonings.join(", ") || "None"}\n` +
            `*Add-ons:* ${selectedAddons.map(a => a.name).join(", ") || "None"}\n` +
            `*Drinks:* ${selectedDrinks.map(d => d.name).join(", ") || "None"}\n` +
            (instructions ? `*Notes:* ${instructions}\n` : "") +
            `\n*Total Paid:* ₹${totalPrice}\n*_PAID VIA RAZORPAY ✅_*`;

        const options = {
            key: "rzp_test_placeholderkey", // ⚠️ Replace with your Razorpay Key ID
            amount: totalPrice * 100,
            currency: "INR",
            name: "French Cartel",
            description: `${selectedSize.name} bowl order`,
            image: "/assets/logo.png",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handler: function (response: any) {
                console.log("Payment ID:", response.razorpay_payment_id);
                const encoded = encodeURIComponent(orderText);
                window.open(`https://wa.me/919924247897?text=${encoded}`, "_blank");
                router.push("/order-confirmed");
            },
            prefill: { name: customerName, contact: customerPhone },
            theme: { color: "#f5c518" },
            modal: { ondismiss: () => console.log("Payment dismissed") },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    }

    const slideVariants = {
        enter: { opacity: 0, x: 40 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
    };

    return (
        <div className="max-w-4xl mx-auto pb-40 md:pb-24 px-4">

            {/* ── Progress Bar ── */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/8 z-0" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent-gold z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((s, i) => {
                        const n = i + 1;
                        const done = step > n;
                        const active = step === n;
                        return (
                            <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300
                                    ${done ? "bg-accent-gold border-accent-gold text-black"
                                        : active ? "bg-primary-bg border-accent-gold text-accent-gold shadow-[0_0_12px_rgba(245,197,24,0.5)]"
                                            : "bg-card-bg border-white/10 text-white/30"}`}
                                >
                                    {done ? <Check className="w-4 h-4" /> : n}
                                </div>
                                <span className={`text-[0.6rem] font-bold tracking-widest uppercase hidden sm:block ${active ? "text-accent-gold" : "text-white/20"}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Step Content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="bg-card-bg border border-white/8 p-6 sm:p-10 relative overflow-hidden"
                >
                    {/* subtle gold corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/[0.04] rounded-bl-full pointer-events-none" />

                    {/* STEP 1 — Size */}
                    {step === 1 && (
                        <div>
                            <StepHeading label="Choose Your Size" sub="The base of your bowl" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {SIZES.map(size => (
                                    <button
                                        key={size.id}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`relative p-5 md:p-6 border-2 text-center transition-all duration-200 group
                                            ${selectedSize?.id === size.id
                                                ? "border-accent-gold bg-accent-gold/10 shadow-[0_0_20px_rgba(245,197,24,0.2)] scale-[1.03]"
                                                : "border-white/10 bg-primary-bg hover:border-accent-gold/40 hover:-translate-y-0.5"}`}
                                    >
                                        {size.id === "megabite" && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-gold text-black text-[0.55rem] font-black tracking-[2px] uppercase px-2.5 py-0.5 flex items-center gap-1 whitespace-nowrap">
                                                <Star className="w-2.5 h-2.5 fill-current" /> Popular
                                            </div>
                                        )}
                                        <span className="text-3xl font-black font-display text-accent-gold/25 block leading-none mb-2">{size.code}</span>
                                        <p className="font-display font-black text-xl text-white mb-0.5">{size.name}</p>
                                        <p className="text-white/30 text-[0.6rem] uppercase tracking-[2px] mb-3">{size.label}</p>
                                        <p className="text-2xl font-black text-accent-gold">₹{size.price}</p>
                                        {selectedSize?.id === size.id && (
                                            <div className="absolute top-2 right-2 bg-accent-gold rounded-full p-0.5">
                                                <Check className="w-3 h-3 text-black" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Sauce */}
                    {step === 2 && (
                        <div>
                            <StepHeading label="Pick Your Sauce" sub={`Select up to 2 · ${selectedSauces.length}/2 chosen`} />
                            <div className="grid grid-cols-2 gap-2">
                                {SAUCES.map(s => (
                                    <Chip key={s} label={s} selected={selectedSauces.includes(s)}
                                        onClick={() => toggleSauce(s)} disabled={selectedSauces.length >= 2} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — Seasoning */}
                    {step === 3 && (
                        <div>
                            <StepHeading label="Pick Your Seasoning" sub={`Select up to 2 · ${selectedSeasonings.length}/2 chosen`} />
                            <div className="grid grid-cols-2 gap-2">
                                {SEASONINGS.map(s => (
                                    <Chip key={s} label={s} selected={selectedSeasonings.includes(s)}
                                        onClick={() => toggleSeasoning(s)} disabled={selectedSeasonings.length >= 2} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4 — Add-ons */}
                    {step === 4 && (
                        <div>
                            <StepHeading label="Any Add-ons?" sub="Make it extra · optional" />
                            <div className="space-y-3">
                                {ADDONS.map(a => {
                                    const sel = !!selectedAddons.find(x => x.id === a.id);
                                    return (
                                        <button key={a.id} type="button" onClick={() => toggleAddon(a)}
                                            className={`w-full flex items-center justify-between p-5 border transition-all duration-200
                                                ${sel ? "border-accent-gold bg-accent-gold/10 shadow-[0_0_15px_rgba(245,197,24,0.15)]"
                                                    : "border-white/8 bg-primary-bg hover:border-accent-gold/30"}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{a.emoji}</span>
                                                <span className="font-bold text-white text-lg">{a.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-accent-gold font-black text-lg">+ ₹{a.price}</span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                    ${sel ? "border-accent-gold bg-accent-gold" : "border-white/20"}`}>
                                                    {sel && <Check className="w-3.5 h-3.5 text-black" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 5 — Drinks */}
                    {step === 5 && (
                        <div>
                            <StepHeading label="Wash It Down" sub="Optional · pick any" />
                            <div className="grid grid-cols-2 gap-3">
                                {DRINKS.map(d => {
                                    const sel = !!selectedDrinks.find(x => x.id === d.id);
                                    return (
                                        <button key={d.id} type="button" onClick={() => toggleDrink(d)}
                                            className={`flex flex-col items-center gap-2 p-6 border transition-all duration-200
                                                ${sel ? "border-accent-gold bg-accent-gold/10"
                                                    : "border-white/8 bg-primary-bg hover:border-accent-gold/30"}`}
                                        >
                                            <span className="text-4xl">{d.emoji}</span>
                                            <span className="font-bold text-white">{d.name}</span>
                                            <span className="text-accent-gold font-black">+ ₹{d.price}</span>
                                            {sel && <div className="mt-1 bg-accent-gold rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 6 — Summary + Checkout */}
                    {step === 6 && (
                        <form id="checkout-form" onSubmit={handleCheckout}>
                            <StepHeading label="Review & Checkout" />

                            {/* ORDER SUMMARY */}
                            <div className="bg-primary-bg border border-white/5 p-5 mb-6 space-y-2.5">
                                <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold mb-3">Your Order</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">{selectedSize?.name} <span className="text-white/30 text-sm">({selectedSize?.code})</span></span>
                                    <span className="font-black text-white">₹{selectedSize?.price}</span>
                                </div>
                                {selectedSauces.length > 0 && (
                                    <p className="text-white/40 text-sm">🥫 Sauces: <span className="text-white/70">{selectedSauces.join(", ")}</span></p>
                                )}
                                {selectedSeasonings.length > 0 && (
                                    <p className="text-white/40 text-sm">🧂 Seasoning: <span className="text-white/70">{selectedSeasonings.join(", ")}</span></p>
                                )}
                                {selectedAddons.map(a => (
                                    <div key={a.id} className="flex justify-between items-center text-sm">
                                        <span className="text-white/70">{a.emoji} {a.name}</span>
                                        <span className="text-accent-gold font-bold">+ ₹{a.price}</span>
                                    </div>
                                ))}
                                {selectedDrinks.map(d => (
                                    <div key={d.id} className="flex justify-between items-center text-sm">
                                        <span className="text-white/70">{d.emoji} {d.name}</span>
                                        <span className="text-accent-gold font-bold">+ ₹{d.price}</span>
                                    </div>
                                ))}
                                <div className="border-t border-accent-gold/20 pt-3 mt-3 flex justify-between items-center">
                                    <span className="font-black text-white text-lg uppercase tracking-wide">Total</span>
                                    <span className="font-black text-accent-gold text-3xl">₹{totalPrice}</span>
                                </div>
                            </div>

                            {/* CUSTOMER DETAILS */}
                            <div className="space-y-3 mb-6">
                                <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold">Your Details</p>
                                <input required type="text" placeholder="Full Name *"
                                    value={customerName} onChange={e => setCustomerName(e.target.value)}
                                    className="w-full bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-accent-gold transition-colors"
                                />
                                <input required type="tel" placeholder="WhatsApp Number * (we'll send order confirmation)"
                                    value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                    className="w-full bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-accent-gold transition-colors"
                                />

                                {/* Pickup only notice */}
                                <div className="flex items-center gap-3 border border-accent-gold/25 bg-accent-gold/5 px-4 py-3 text-sm">
                                    <span className="text-2xl">🏪</span>
                                    <div>
                                        <p className="font-bold text-accent-gold text-sm">Pickup Only</p>
                                        <p className="text-white/40 text-xs">Hazira Rd, near Pal RTO, Adajan, Surat</p>
                                    </div>
                                </div>

                                <textarea rows={2} placeholder="Special Instructions (Optional)"
                                    value={instructions} onChange={e => setInstructions(e.target.value)}
                                    className="w-full bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-accent-gold transition-colors resize-none"
                                />
                            </div>

                            {/* NO COD NOTICE */}
                            <div className="bg-[#E3342F]/10 border border-[#E3342F]/30 px-5 py-4 mb-4 text-center">
                                <p className="text-[#ff5c5c] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                    <Zap className="w-4 h-4" /> Online Payment Only — No Cash on Delivery
                                </p>
                                <p className="text-white/40 text-xs mt-1">Your order is confirmed ONLY after payment. We&apos;ll WhatsApp you confirmation on your number.</p>
                            </div>

                            {/* TRUST BADGES */}
                            <div className="flex items-center justify-center gap-6 text-xs text-white/30 mb-6">
                                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure Payment</span>
                                <span className="w-px h-3 bg-white/10" />
                                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Made Fresh to Order</span>
                                <span className="w-px h-3 bg-white/10" />
                                <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> No COD</span>
                            </div>
                        </form>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Navigation ── */}
            <div className="mt-6 flex justify-between items-center">
                {step > 1 ? (
                    <button type="button" onClick={() => setStep(p => p - 1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors py-3 px-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                ) : <div />}

                {step < 6 ? (
                    <button type="button" onClick={() => setStep(p => p + 1)} disabled={!canNext}
                        className="flex items-center gap-2 bg-accent-gold text-black font-black uppercase tracking-[2px] text-sm py-4 px-8 hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {step === 5 ? "Review Order" : "Next"} <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button form="checkout-form" type="submit"
                        disabled={!customerName || !customerPhone || !selectedSize}
                        className="flex items-center gap-3 bg-accent-gold text-black font-black uppercase tracking-[2px] text-sm py-4 px-8 hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(245,197,24,0.35)] disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                    >
                        <Lock className="w-4 h-4" /> Pay & Confirm Order — ₹{totalPrice}
                    </button>
                )}
            </div>

            {/* ── Sticky mobile price bar ── */}
            {step < 6 && selectedSize && (
                <div className="fixed bottom-0 left-0 w-full bg-[#070707] border-t border-accent-gold/20 px-4 py-4 flex justify-between items-center z-40 md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
                    <div>
                        <p className="text-white/30 text-[0.6rem] uppercase tracking-[3px]">Current Total</p>
                        <p className="text-2xl font-black text-accent-gold font-display">₹{totalPrice}</p>
                    </div>
                    {step < 6 && (
                        <button onClick={() => setStep(p => Math.min(p + 1, 6))} disabled={!canNext}
                            className="bg-accent-gold text-black font-black uppercase tracking-[2px] text-xs py-3 px-6 disabled:opacity-40"
                        >
                            Next →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
