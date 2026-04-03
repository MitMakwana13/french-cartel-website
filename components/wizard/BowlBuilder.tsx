"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, ShoppingBag, Lock, Zap, Star } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { MenuItem } from "@/lib/supabase/types";

// ─── Types ──────────────────────────────────────────────────────────────────
type Size = MenuItem;
type Addon = MenuItem;
type Sauce = MenuItem;
type Seasoning = MenuItem;

const STEPS = [
    { label: "Size", short: "S" },
    { label: "Sauce", short: "S" },
    { label: "Seasoning", short: "S" },
    { label: "Add-ons", short: "A" },
    { label: "Drinks", short: "D" },
    { label: "Checkout", short: "C" },
];

// ─── Native Hardware Helper ───────────────────────────────────────────────────
function getFormattedTime12(time24: string) {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    let hr = parseInt(h);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ampm}`;
}

// ─── UI Components ───────────────────────────────────────────────────────────
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
    const { showToast } = useToast();

    // System States
    const [loading, setLoading] = useState(true);
    const [storeStatus, setStoreStatus] = useState<any>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Dynamic Menu Arrays
    const [rawSizes, setSizes] = useState<Size[]>([]);
    const [rawSauces, setSauces] = useState<Sauce[]>([]);
    const [rawSeasonings, setSeasonings] = useState<Seasoning[]>([]);
    const [rawAddons, setAddons] = useState<Addon[]>([]);
    const [rawDrinks, setDrinks] = useState<Addon[]>([]);

    // User States
    const [step, setStep] = useState(1);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [selectedSauces, setSelectedSauces] = useState<Sauce[]>([]);
    const [selectedSeasonings, setSelectedSeasonings] = useState<Seasoning[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
    const [selectedDrinks, setSelectedDrinks] = useState<Addon[]>([]);
    
    // Form Checkout States
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [instructions, setInstructions] = useState("");

    // Initial Fetcher
    useEffect(() => {
        async function fetchSystem() {
            try {
                // Fetch BOTH the status constraint and the public Menu list
                const [statusRes, menuRes] = await Promise.all([
                    fetch('/api/settings/status'),
                    fetch('/api/menu')
                ]);
                
                const statusData = await statusRes.json();
                setStoreStatus(statusData);

                const menuData = await menuRes.json();
                if (menuData.data) {
                    const items: MenuItem[] = menuData.data;
                    
                    // Filter arrays by availability naturally
                    const availableItems = items.filter(i => i.is_available);
                    setSizes(availableItems.filter(i => i.category === 'size'));
                    setSauces(availableItems.filter(i => i.category === 'sauce'));
                    setSeasonings(availableItems.filter(i => i.category === 'seasoning'));
                    setAddons(availableItems.filter(i => i.category === 'addon'));
                    setDrinks(availableItems.filter(i => i.category === 'drink'));
                }
            } catch (err) {
                console.error("Failed to load systems", err);
                showToast("Connection to the Cartel servers failed.");
            } finally {
                setLoading(false);
            }
        }
        fetchSystem();
    }, [showToast]);

    // Live price
    const totalPrice = useMemo(() => {
        let t = selectedSize?.price ?? 0;
        selectedAddons.forEach(a => (t += a.price));
        selectedDrinks.forEach(d => (t += d.price));
        return t;
    }, [selectedSize, selectedAddons, selectedDrinks]);


    // Toggle helpers matching specific DB logic
    function toggleSauce(s: Sauce) {
        setSelectedSauces(prev => {
            if (prev.find(x => x.id === s.id)) return prev.filter(x => x.id !== s.id);
            if (prev.length >= 2) { showToast("Max 2 sauces allowed! 🌶️"); return prev; }
            return [...prev, s];
        });
    }
    function toggleSeasoning(s: Seasoning) {
        setSelectedSeasonings(prev => {
            if (prev.find(x => x.id === s.id)) return prev.filter(x => x.id !== s.id);
            if (prev.length >= 2) { showToast("Max 2 seasonings allowed! 🧂"); return prev; }
            return [...prev, s];
        });
    }
    function toggleAddon(a: Addon) {
        setSelectedAddons(prev => prev.find(x => x.id === a.id) ? prev.filter(x => x.id !== a.id) : [...prev, a]);
    }
    function toggleDrink(d: Addon) {
        setSelectedDrinks(prev => prev.find(x => x.id === d.id) ? prev.filter(x => x.id !== d.id) : [...prev, d]);
    }

    const canNext = step === 1 ? !!selectedSize : step === 6 ? !!(customerName && /^\d{10}$/.test(customerPhone)) : true;

    // Razorpay checkout
    async function handleCheckout(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedSize || !customerName || !/^\d{10}$/.test(customerPhone) || isCheckingOut) {
            if (!/^\d{10}$/.test(customerPhone)) showToast("Phone number must be exactly 10 digits");
            return;
        }
        setIsCheckingOut(true);

        // Security: Mid-flight Status Check
        try {
            const statusCheck = await fetch('/api/settings/status');
            const currentStatus = await statusCheck.json();
            if (currentStatus.is_open === false) {
                setStoreStatus(currentStatus); // Trigger overlay natively
                setIsCheckingOut(false);
                return; // Abort payments entirely
            }
        } catch (e) {
            console.error("Failed mid-flight status check.");
        }

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
        if (!ok) { 
            showToast("Payment SDK failed to load. Please try again."); 
            setIsCheckingOut(false);
            return; 
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholderkey",
            amount: totalPrice * 100,
            currency: "INR",
            name: "French Cartel",
            description: `${selectedSize.name} bowl order`,
            image: "/assets/logo.png",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handler: async function (response: any) {
                try {
                    // 1. Post to our API exactly how the UI is laid out dynamically
                    const orderPayload = {
                        customer_name: customerName,
                        customer_phone: customerPhone,
                        payment_id: response.razorpay_payment_id,
                        total_price: totalPrice,
                        instructions: instructions,
                        items: {
                           size: selectedSize,
                           sauces: selectedSauces.map(s => s.name),
                           seasonings: selectedSeasonings.map(s => s.name),
                           addons: selectedAddons.map(a => ({ name: a.name, emoji: a.emoji, price: a.price })),
                           drinks: selectedDrinks.map(d => ({ name: d.name, emoji: d.emoji, price: d.price }))
                        }
                    };

                    const orderRes = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderPayload)
                    });
                    
                    const { data: orderData, error } = await orderRes.json();
                    if (error || !orderData) throw new Error(error || "Unknown db error");

                    const orderNumber = orderData.order_number;

                    // 2. Transmit standard formatting with the explicit #Order tag injected
                    const orderText =
                        `*🍟 NEW ORDER #${orderNumber} — FRENCH CARTEL*\n\n` +
                        `*Name:* ${customerName}\n*WhatsApp:* ${customerPhone}\n` +
                        `*Order Type:* 🏪 Pickup\n\n` +
                        `*Size:* ${selectedSize.name} (${selectedSize.code || ''})\n` +
                        `*Sauces:* ${selectedSauces.map(s => s.name).join(", ") || "None"}\n` +
                        `*Seasoning:* ${selectedSeasonings.map(s => s.name).join(", ") || "None"}\n` +
                        `*Add-ons:* ${selectedAddons.map(a => `${a.emoji} ${a.name}`).join(", ") || "None"}\n` +
                        `*Drinks:* ${selectedDrinks.map(d => `${d.emoji} ${d.name}`).join(", ") || "None"}\n` +
                        (instructions ? `*Notes:* ${instructions}\n` : "") +
                        `\n*Total Paid:* ₹${totalPrice}\n*_PAID VIA RAZORPAY ✅_*`;

                    const encoded = encodeURIComponent(orderText);
                    window.open(`https://wa.me/919924247897?text=${encoded}`, "_blank");
                    
                    router.push(`/order-confirmed?order=${orderNumber}`);

                } catch (err) {
                    setIsCheckingOut(false);
                    showToast("Payment captured, but API synchronization failed. Please call the truck directly!");
                }
            },
            prefill: { name: customerName, contact: customerPhone },
            theme: { color: "#f5c518" },
            modal: { ondismiss: () => setIsCheckingOut(false) },
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

    // ─── Status Catchers ──────────────────────────────────────────

    if (loading) {
        return (
           <div className="flex justify-center items-center h-64 text-accent-gold flex-col gap-4">
              <span className="w-10 h-10 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin"></span>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Checking Cartel Operations...</p>
           </div>
        );
    }

    if (storeStatus?.is_open === false) {
        const h = storeStatus.today_hours;
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in-up">
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-8 md:p-12 rounded-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-bl-full blur-[40px] pointer-events-none" />
                   <h2 className="text-3xl font-black font-display text-white mb-4">🔴 We're currently closed.</h2>
                   {storeStatus.closed_reason && (
                      <p className="text-xl text-accent-gold italic font-display mb-6">"{storeStatus.closed_reason}"</p>
                   )}
                   {h && (
                      <div className="bg-primary-bg/50 p-4 border border-white/5 rounded-sm inline-block mx-auto mb-8">
                         <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-bold">Today's Standard Hours</p>
                         <p className="text-white text-lg font-black">{getFormattedTime12(h.open_time)} — {getFormattedTime12(h.close_time)}</p>
                      </div>
                   )}
                   <button onClick={() => router.push('/menu')} className="block w-full border-2 border-white/10 hover:border-white hover:bg-white hover:text-black py-4 font-black uppercase tracking-widest transition-all">
                      Browse Menu Anyway
                   </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-40 md:pb-24 px-4 overflow-x-hidden">

            {/* Top Configs (Wait times, Announcements) */}
            {storeStatus && (
               <div className="mb-8 space-y-3">
                  {storeStatus.announcement && (
                     <div className="bg-accent-gold/10 border border-accent-gold text-accent-gold px-4 py-3 text-sm rounded-sm font-bold animate-fade-in-up">
                        {storeStatus.announcement}
                     </div>
                  )}
                  <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-bold">
                     <ClockIcon className="w-3.5 h-3.5 text-accent-gold" />
                     Estimated processing delay: <span className="text-white">{storeStatus.estimated_wait_minutes} Minutes</span>
                  </div>
               </div>
            )}

            {/* ── Progress Bar ── */}
            <div className="mb-10 w-full overflow-hidden">
                <div className="flex items-center justify-between relative px-2">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 z-0" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent-gold z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((s, i) => {
                        const n = i + 1;
                        const done = step > n;
                        const active = step === n;
                        return (
                            <div key={s.label} className="relative z-10 flex flex-col items-center gap-2 bg-primary-bg px-2">
                                <div className={`shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-black border-2 transition-all duration-300
                                    ${done ? "bg-accent-gold border-accent-gold text-black"
                                        : active ? "bg-primary-bg border-accent-gold text-accent-gold shadow-[0_0_12px_rgba(245,197,24,0.5)]"
                                            : "bg-card-bg border-white/10 text-white/30"}`}
                                >
                                    {done ? <Check className="w-4 h-4" /> : n}
                                </div>
                                <span className={`text-[0.55rem] md:text-[0.6rem] font-bold tracking-widest uppercase hidden sm:block whitespace-nowrap ${active ? "text-accent-gold" : "text-white/20"}`}>
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
                    className="bg-card-bg border border-white/10 p-5 sm:p-10 relative overflow-hidden rounded-sm w-full"
                >
                    {/* subtle gold corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/[0.04] rounded-bl-full pointer-events-none" />

                    {/* STEP 1 — Size */}
                    {step === 1 && (
                        <div className="w-full">
                            <StepHeading label="Choose Your Size" sub="The base of your bowl" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                                {rawSizes.map(size => (
                                    <button
                                        key={size.id}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`relative p-4 md:p-6 border-2 text-center transition-all duration-200 group flex items-center flex-col
                                            ${selectedSize?.id === size.id
                                                ? "border-accent-gold bg-accent-gold/10 shadow-[0_0_20px_rgba(245,197,24,0.2)] scale-[1.03] z-10"
                                                : "border-white/10 bg-primary-bg hover:border-accent-gold/40 hover:-translate-y-0.5 z-0"}`}
                                    >
                                        {size.is_popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-gold text-black text-[0.55rem] font-black tracking-[2px] uppercase px-2.5 py-0.5 flex items-center gap-1 whitespace-nowrap shadow-md">
                                                <Star className="w-2.5 h-2.5 fill-current" /> Popular
                                            </div>
                                        )}
                                        {size.code && <span className="text-3xl font-black font-display text-accent-gold/25 block leading-none mb-2">{size.code}</span>}
                                        <p className="font-display font-black text-xl text-white mb-0.5 truncate w-full">{size.name}</p>
                                        <p className="text-white/30 text-[0.6rem] uppercase tracking-[2px] mb-3 truncate w-full">{size.label || 'Standard'}</p>
                                        <p className="text-2xl font-black text-accent-gold shrink-0">₹{size.price}</p>
                                        {selectedSize?.id === size.id && (
                                            <div className="absolute top-2 right-2 bg-accent-gold rounded-full p-0.5">
                                                <Check className="w-3 h-3 text-black" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {rawSizes.length === 0 && <p className="col-span-full text-white/30 text-sm">No sizes available right now.</p>}
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Sauce */}
                    {step === 2 && (
                        <div className="w-full">
                            <StepHeading label="Pick Your Sauce" sub={`Select up to 2 · ${selectedSauces.length}/2 chosen`} />
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {rawSauces.map(s => (
                                    <Chip key={s.id} label={`${s.emoji || ''} ${s.name}`} selected={!!selectedSauces.find(x => x.id === s.id)}
                                        onClick={() => toggleSauce(s)} disabled={selectedSauces.length >= 2} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — Seasoning */}
                    {step === 3 && (
                        <div className="w-full">
                            <StepHeading label="Pick Your Seasoning" sub={`Select up to 2 · ${selectedSeasonings.length}/2 chosen`} />
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {rawSeasonings.map(s => (
                                    <Chip key={s.id} label={`${s.emoji || ''} ${s.name}`} selected={!!selectedSeasonings.find(x => x.id === s.id)}
                                        onClick={() => toggleSeasoning(s)} disabled={selectedSeasonings.length >= 2} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4 — Add-ons */}
                    {step === 4 && (
                        <div className="w-full">
                            <StepHeading label="Any Add-ons?" sub="Make it extra · optional" />
                            <div className="space-y-3 w-full">
                                {rawAddons.map(a => {
                                    const sel = !!selectedAddons.find(x => x.id === a.id);
                                    return (
                                        <button key={a.id} type="button" onClick={() => toggleAddon(a)}
                                            className={`w-full flex items-center justify-between p-4 border transition-all duration-200
                                                ${sel ? "border-accent-gold bg-accent-gold/10 shadow-[0_0_15px_rgba(245,197,24,0.15)]"
                                                    : "border-white/8 bg-primary-bg hover:border-accent-gold/30"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {a.emoji && <span className="text-2xl">{a.emoji}</span>}
                                                <span className="font-bold text-white text-base text-left">{a.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-accent-gold font-black text-base md:text-lg whitespace-nowrap">+ ₹{a.price}</span>
                                                <div className={`shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all
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
                        <div className="w-full">
                            <StepHeading label="Wash It Down" sub="Optional · pick any" />
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {rawDrinks.map(d => {
                                    const sel = !!selectedDrinks.find(x => x.id === d.id);
                                    return (
                                        <button key={d.id} type="button" onClick={() => toggleDrink(d)}
                                            className={`flex flex-col items-center gap-2 p-5 border transition-all duration-200 relative
                                                ${sel ? "border-accent-gold bg-accent-gold/10"
                                                    : "border-white/8 bg-primary-bg hover:border-accent-gold/30"}`}
                                        >
                                            {d.emoji && <span className="text-3xl md:text-4xl">{d.emoji}</span>}
                                            <span className="font-bold text-white text-center text-sm md:text-base">{d.name}</span>
                                            <span className="text-accent-gold font-black">+ ₹{d.price}</span>
                                            {sel && <div className="absolute top-2 right-2 bg-accent-gold rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 6 — Summary + Checkout */}
                    {step === 6 && (
                        <form id="checkout-form" onSubmit={handleCheckout} className="w-full">
                            <StepHeading label="Review & Checkout" />

                            {/* ORDER SUMMARY */}
                            <div className="bg-primary-bg border border-white/5 p-4 md:p-5 mb-6 space-y-2.5">
                                <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold mb-3">Your Order</p>
                                <div className="flex justify-between items-center whitespace-nowrap">
                                    <span className="font-bold text-white max-w-[60%] truncate">{selectedSize?.name} <span className="text-white/30 text-sm hidden sm:inline">({selectedSize?.code})</span></span>
                                    <span className="font-black text-white shrink-0">₹{selectedSize?.price}</span>
                                </div>
                                {selectedSauces.length > 0 && (
                                    <p className="text-white/40 text-sm">🥫 Sauces: <span className="text-white/70">{selectedSauces.map(s=>s.name).join(", ")}</span></p>
                                )}
                                {selectedSeasonings.length > 0 && (
                                    <p className="text-white/40 text-sm">🧂 Seasoning: <span className="text-white/70">{selectedSeasonings.map(s=>s.name).join(", ")}</span></p>
                                )}
                                {selectedAddons.map(a => (
                                    <div key={a.id} className="flex justify-between items-center text-sm">
                                        <span className="text-white/70 truncate">{a.emoji} {a.name}</span>
                                        <span className="text-accent-gold font-bold shrink-0">+ ₹{a.price}</span>
                                    </div>
                                ))}
                                {selectedDrinks.map(d => (
                                    <div key={d.id} className="flex justify-between items-center text-sm">
                                        <span className="text-white/70 truncate">{d.emoji} {d.name}</span>
                                        <span className="text-accent-gold font-bold shrink-0">+ ₹{d.price}</span>
                                    </div>
                                ))}
                                <div className="border-t border-accent-gold/20 pt-3 mt-3 flex justify-between items-center">
                                    <span className="font-black text-white text-lg uppercase tracking-wide">Total</span>
                                    <span className="font-black text-accent-gold text-2xl md:text-3xl">₹{totalPrice}</span>
                                </div>
                            </div>

                            {/* CUSTOMER DETAILS */}
                            <div className="space-y-3 mb-6 w-full">
                                <p className="text-white/30 text-xs uppercase tracking-[3px] font-bold">Your Details</p>
                                <input required type="text" placeholder="Full Name *"
                                    value={customerName} onChange={e => setCustomerName(e.target.value)}
                                    className="w-full block bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-accent-gold transition-colors"
                                />
                                <input required type="tel" placeholder="10-Digit WhatsApp Number"
                                    value={customerPhone} 
                                    onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="w-full block bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-accent-gold transition-colors"
                                />

                                {/* Pickup only notice */}
                                <div className="flex items-center gap-3 border border-accent-gold/25 bg-accent-gold/5 px-4 py-3 text-sm">
                                    <span className="text-2xl shrink-0">🏪</span>
                                    <div>
                                        <p className="font-bold text-accent-gold text-sm">Pickup Only</p>
                                        <p className="text-white/40 text-xs truncate">Hazira Rd, near Pal RTO, Adajan, Surat</p>
                                    </div>
                                </div>

                                <textarea rows={2} placeholder="Instructions (Optional)"
                                    value={instructions} onChange={e => setInstructions(e.target.value)}
                                    className="w-full block bg-primary-bg border border-white/10 px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-accent-gold transition-colors resize-none"
                                />
                            </div>

                            {/* NO COD NOTICE */}
                            <div className="bg-[#E3342F]/10 border border-[#E3342F]/30 px-4 py-4 mb-4 text-center">
                                <p className="text-[#ff5c5c] font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2">
                                    <Zap className="w-3.5 h-3.5 shrink-0" /> Online Payment Only
                                </p>
                                <p className="text-white/40 text-[0.65rem] md:text-xs mt-1">Order confirmed ONLY after payment completion.</p>
                            </div>

                            {/* TRUST BADGES */}
                            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[0.65rem] text-white/30 mb-6 w-full">
                                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Secure</span>
                                <span className="w-px h-3 bg-white/10 hidden sm:block" />
                                <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Made Fresh</span>
                            </div>
                        </form>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Navigation ── */}
            <div className="mt-6 flex justify-between items-center px-1">
                {step > 1 ? (
                    <button type="button" onClick={() => setStep(p => p - 1)}
                        className="flex items-center gap-1.5 md:gap-2 text-white/40 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors py-3 px-2 md:px-4 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                ) : <div />}

                {step < 6 ? (
                    <button type="button" onClick={() => setStep(p => p + 1)} disabled={!canNext}
                        className="flex items-center gap-2 bg-accent-gold text-black font-black uppercase tracking-[2px] text-xs md:text-sm py-4 px-6 md:px-8 hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 whitespace-nowrap"
                    >
                        {step === 5 ? "Review" : "Next"} <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button form="checkout-form" type="submit"
                        disabled={!customerName || !/^\d{10}$/.test(customerPhone) || !selectedSize || isCheckingOut}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-accent-gold text-black font-black uppercase tracking-widest md:tracking-[2px] text-[0.65rem] md:text-sm py-4 px-4 md:px-8 hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(245,197,24,0.35)] disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                    >
                        {isCheckingOut ? (
                           <span className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> Intercepting
                           </span>
                        ) : (
                           <><Lock className="w-4 h-4 hidden md:block" /> Pay ₹{totalPrice}</>
                        )}
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

// Just an icon to extract cleanly above
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
