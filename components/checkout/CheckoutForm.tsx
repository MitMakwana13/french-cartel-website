"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { format, addMinutes, setHours, setMinutes, isBefore } from "date-fns";
import { Clock, User, Phone, Loader2, ArrowRight } from "lucide-react";

export default function CheckoutForm() {
    const router = useRouter();
    const { items, getCartTotal, clearCart } = useCartStore();
    
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Time slots generation
    const [availableSlots, setAvailableSlots] = useState<{ time: Date; formatted: string; isPast: boolean }[]>([]);

    useEffect(() => {
        // Generate slots from 5:00 PM to 11:00 PM
        const slots = [];
        const now = new Date();
        const start = setMinutes(setHours(now, 17), 0); // 17:00
        const end = setMinutes(setHours(now, 23), 0);   // 23:00

        let current = start;
        while (isBefore(current, end) || current.getTime() === end.getTime()) {
            slots.push({
                time: current,
                formatted: format(current, "h:mm a"),
                isPast: isBefore(current, now),
            });
            current = addMinutes(current, 30);
        }
        setAvailableSlots(slots);
        
        // Load razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const total = getCartTotal();

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (items.length === 0) {
            setError("Your cart is empty");
            return;
        }

        if (!name.trim() || !phone.trim() || !pickupTime) {
            setError("Please fill all fields");
            return;
        }

        if (phone.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            // 1. Create order on backend (creates Razorpay order + Supabase order)
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    pickupTime,
                    items
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate checkout");
            }

            // 2. Open Razorpay Checkout Window
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.razorpayOrder.amount, // in paise
                currency: "INR",
                name: "French Cartel",
                description: "Takeaway Order",
                order_id: data.razorpayOrder.id,
                prefill: {
                    name: name,
                    contact: phone,
                },
                theme: { color: "#c9a84c" },
                handler: function () {
                    // Payment successful callback
                    // In a production app you'd verify the signature on your server via a webhook or a separate completion route.
                    // Here we redirect to confirmation right away.
                    clearCart();
                    router.push(`/order-confirmed/${data.orderId}`);
                },
            };

            interface RazorpayInstance {
                open: () => void;
                on: (event: string, handler: (resp: any) => void) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            
            interface RazorpayConstructor {
                new (options: any): RazorpayInstance; // eslint-disable-line @typescript-eslint/no-explicit-any
            }

            const rzp = new (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay(options);
            
            rzp.on('payment.failed', function (response: { error: { description: string } }) {
                setError(`Payment Failed: ${response.error.description}`);
                setIsLoading(false);
            });
            
            rzp.open();

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
            console.error(err);
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-card-bg border border-white/5 p-8 text-center mt-10">
                <p className="text-foreground/50 mb-6 font-body">Your cart is empty.</p>
                <button 
                    onClick={() => router.push("/menu")}
                    className="bg-accent-gold text-background px-8 py-3 font-display font-black tracking-[2px] uppercase text-sm hover:opacity-90 transition-opacity"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* LEFT: FORM */}
            <div className="bg-card-bg border border-white/5 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 blur-[50px] pointer-events-none" />
                
                <h2 className="text-2xl font-display font-black text-foreground mb-8 tracking-wider uppercase">Order Details</h2>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 mb-6 font-body rounded-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleCheckout} className="space-y-6">
                    <div>
                        <label className="block text-foreground/60 text-xs font-bold uppercase tracking-[2px] mb-2 font-body">Name</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-4 flex items-center text-foreground/30">
                                <User size={18} />
                            </span>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full bg-background border border-white/10 text-foreground py-3 pl-12 pr-4 focus:outline-none focus:border-accent-gold/50 transition-colors rounded-sm"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-foreground/60 text-xs font-bold uppercase tracking-[2px] mb-2 font-body">Phone</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-4 flex items-center text-foreground/30">
                                <Phone size={18} />
                            </span>
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className="w-full bg-background border border-white/10 text-foreground py-3 pl-12 pr-4 focus:outline-none focus:border-accent-gold/50 transition-colors rounded-sm"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-foreground/60 text-xs font-bold uppercase tracking-[2px] mb-3 font-body">Pickup Time (Today)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {availableSlots.map((slot) => {
                                const isSelected = pickupTime === slot.time.toISOString();
                                return (
                                    <button
                                        type="button"
                                        key={slot.time.toISOString()}
                                        disabled={slot.isPast}
                                        onClick={() => setPickupTime(slot.time.toISOString())}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-sm border transition-all duration-200 text-sm font-bold tracking-wide ${
                                            slot.isPast 
                                                ? "opacity-30 cursor-not-allowed border-white/5 bg-background text-foreground/30" 
                                                : isSelected
                                                    ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                                                    : "border-white/10 bg-background text-foreground hover:border-accent-gold/40"
                                        }`}
                                    >
                                        <Clock size={14} className={isSelected ? "text-accent-gold" : "text-foreground/40"} />
                                        {slot.formatted}
                                    </button>
                                );
                            })}
                        </div>
                        {availableSlots.every(s => s.isPast) && (
                            <p className="text-red-400 text-xs mt-3">We are closed for the day. Come back tomorrow!</p>
                        )}
                    </div>
                </form>
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="flex flex-col gap-6">
                <div className="bg-card-bg border border-white/5 p-6 sm:p-8">
                    <h2 className="text-2xl font-display font-black text-foreground mb-6 tracking-wider uppercase">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => (
                            <div key={`${item.menu_item_id}-${item.special_instructions}`} className="flex justify-between items-start pb-4 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="font-bold text-foreground text-sm font-display tracking-widest">{item.name}</p>
                                    <p className="text-foreground/40 text-xs mt-1">Qty: {item.quantity}</p>
                                    {item.special_instructions && (
                                        <p className="text-accent-gold text-xs italic mt-1 font-medium bg-accent-gold/5 inline-block px-2 py-0.5">Note: {item.special_instructions}</p>
                                    )}
                                </div>
                                <span className="font-bold text-foreground ml-4 shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-accent-gold/20 pt-6 mt-auto">
                        <span className="text-foreground/60 text-sm font-bold uppercase tracking-[2px]">Total Payment</span>
                        <span className="text-3xl font-display font-black text-accent-gold">₹{total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={isLoading || availableSlots.every(s => s.isPast)}
                    className="w-full bg-accent-gold text-background py-5 font-display font-black uppercase tracking-[3px] text-lg hover:shadow-[0_0_40px_rgba(201,168,76,0.3)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group rounded-sm"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Pay Securely
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
                <p className="text-center text-foreground/30 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Payments processed by Razorpay
                </p>
            </div>

        </div>
    );
}
