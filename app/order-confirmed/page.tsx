"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle, MapPin, Clock, ChefHat, PartyPopper } from "lucide-react";

function TrackedOrder() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get("order");

    const [status, setStatus] = useState<string>("new");
    const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [orderCustomerPhone, setOrderCustomerPhone] = useState<string | null>(null);

    // Native audio initializer for success chime
    const playSuccessChime = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
            osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.8);
        } catch (e) {
            console.warn("Audio context restricted.");
        }
    };

    // Initialize OS Notifications
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        if (!orderNumber) return;
        
        const supabase = createClient();
        const orderNumInt = parseInt(orderNumber, 10);

        async function fetchStatus() {
            try {
                const res = await fetch(`/api/orders/track?order_number=${orderNumber}`);
                if (res.ok) {
                    const { data } = await res.json();
                    setStatus(data.status);
                    if (data.rejection_reason) setRejectionReason(data.rejection_reason);
                    if (data.customer_phone) setOrderCustomerPhone(data.customer_phone);
                    
                    if (data.estimated_ready_at) {
                        const readyTime = new Date(data.estimated_ready_at);
                        const diffMins = Math.max(0, Math.round((readyTime.getTime() - Date.now()) / 60000));
                        setEstimatedTime(`~${diffMins} mins`);
                    } else if (data.status === 'new') {
                        setEstimatedTime("Calculating...");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch order status.");
            }
        }

        fetchStatus(); // First execution

        // Initialize Realtime WebSocket Connection specific to this order
        const channel = supabase
            .channel(`public:orders:order_number=eq.${orderNumInt}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `order_number=eq.${orderNumInt}`,
                },
                (payload) => {
                    const updatedOrder = payload.new;
                    setStatus(updatedOrder.status);
                    if (updatedOrder.rejection_reason) setRejectionReason(updatedOrder.rejection_reason);
                    if (updatedOrder.customer_phone) setOrderCustomerPhone(updatedOrder.customer_phone);
                    
                    if (updatedOrder.estimated_ready_at) {
                        const readyTime = new Date(updatedOrder.estimated_ready_at);
                        const diffMins = Math.max(0, Math.round((readyTime.getTime() - Date.now()) / 60000));
                        setEstimatedTime(`~${diffMins} mins`);
                    }

                    if (updatedOrder.status === 'ready' && status !== 'ready') {
                        playSuccessChime();
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(`French Cartel — Order #${orderNumInt}`, {
                                body: "🎉 Your order is READY for pickup! Head over to the counter.",
                                icon: "/assets/logo.png"
                            });
                        }
                    } else if (updatedOrder.status === 'cancelled' && status !== 'cancelled') {
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(`French Cartel — Order #${orderNumInt}`, {
                                body: `❌ Your order was cancelled. ${updatedOrder.rejection_reason || 'Please contact us for details.'}`
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
             supabase.removeChannel(channel);
        };
    }, [orderNumber]);

    // Progress Helper
    const progressIndex = ["new", "accepted", "preparing", "ready"].indexOf(status);
    const resolvedIndex = progressIndex === -1 ? 0 : progressIndex;

    const isReady = status === 'ready' || status === 'completed';

    return (
        <div className="max-w-md w-full text-center relative z-10 mx-auto px-4">
            {/* Cancelled Banner — Rich version with reason + refund message */}
            {status === 'cancelled' && (
                <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 w-full animate-fade-in-up z-20">
                    <div className="bg-[#ef4444]/15 border-2 border-[#ef4444]/60 shadow-[0_0_40px_rgba(239,68,68,0.3)] px-5 py-5 rounded-xl flex flex-col items-start gap-3 mb-6 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">❌</span>
                            <span className="font-black font-display text-[#ef4444] text-xl tracking-wide uppercase">Order Cancelled</span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">
                            {rejectionReason || "Your order was cancelled. Please contact us for details."}
                        </p>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 w-full rounded-sm">
                            <p className="text-white/50 text-xs">💳 Your payment of <span className="text-white font-bold">₹{searchParams.get('amount') || '—'}</span> will be refunded within <span className="text-white font-bold">3–5 business days</span> automatically.</p>
                        </div>
                        <a
                            href={`https://wa.me/919924247897?text=${encodeURIComponent(`Hi French Cartel! My order #${orderNumber} was cancelled. Can you help me? 🙏`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black text-xs font-black uppercase px-4 py-2.5 rounded-sm tracking-wider"
                        >
                            💬 WhatsApp Us
                        </a>
                    </div>
                </div>
            )}

            {/* Confetti / Glow Banner if Ready */}
            {isReady && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full animate-fade-in-up z-20">
                    <div className="bg-green-500/20 border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)] px-4 py-4 rounded-xl flex items-center justify-center gap-3 mb-6 backdrop-blur-md">
                        <PartyPopper className="w-8 h-8 text-green-400" />
                        <span className="font-black font-display text-green-400 text-xl tracking-wide uppercase">Your order is READY!</span>
                    </div>
                </div>
            )}

            {/* General Header Block */}
            <div className={`transition-all duration-700 ${isReady || status === 'cancelled' ? 'mt-20 opacity-50' : 'mt-0'}`}>
                <div className="flex justify-center mb-6 pt-10">
                    <Image src="/assets/logo.png" alt="French Cartel" width={100} height={100} className="object-contain drop-shadow-[0_0_30px_rgba(245,197,24,0.4)]" />
                </div>

                <div className="flex justify-center mb-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-full p-3">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-display font-black text-white mb-2">Order Confirmed!</h1>
                {orderNumber && (
                    <p className="text-2xl font-display font-bold text-accent-gold italic mb-4">
                        Order #{orderNumber} 🍟
                    </p>
                )}
            </div>

            {/* LIVE TRACKING SYSTEM */}
            {!isReady ? (
                <div className="bg-card-bg/50 border border-white/10 p-6 rounded-sm mb-8 mt-6">
                   <p className="text-white/40 text-[0.65rem] uppercase tracking-[3px] font-bold mb-4">Live Status Tracking</p>
                   
                   <div className="flex flex-col gap-5 items-start text-left px-4">
                      {/* STEP 1: Placed */}
                      <div className="flex items-center gap-4 w-full">
                         <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${resolvedIndex >= 0 ? "bg-accent-gold text-black shadow-[0_0_15px_rgba(245,197,24,0.3)]" : "bg-white/5 text-white/20"}`}>
                            <CheckCircle className="w-4 h-4" />
                         </div>
                         <div className="flex-1">
                            <p className={`font-bold ${resolvedIndex >= 0 ? "text-white" : "text-white/40"}`}>Order Placed 🟡</p>
                            {resolvedIndex === 0 && <p className="text-accent-gold text-xs mt-0.5">Kitchen is reviewing...</p>}
                         </div>
                      </div>

                      <div className="w-px h-6 bg-white/10 ml-4 -my-3" />

                      {/* STEP 2: Preparing */}
                      <div className="flex items-center gap-4 w-full">
                         <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${resolvedIndex >= 1 ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "bg-white/5 text-white/20"}`}>
                            <ChefHat className="w-4 h-4" />
                         </div>
                         <div className="flex-1 flex justify-between items-center">
                            <div>
                               <p className={`font-bold ${resolvedIndex >= 1 ? "text-white" : "text-white/40"}`}>Being Prepared 🔵</p>
                               {resolvedIndex >= 1 && resolvedIndex < 3 && estimatedTime && (
                                  <p className="text-blue-400 text-xs mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3"/> Ready in {estimatedTime}</p>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="w-px h-6 bg-white/10 ml-4 -my-3" />

                      {/* STEP 3: Ready */}
                      <div className="flex items-center gap-4 w-full">
                         <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${resolvedIndex >= 3 ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/5 text-white/20"}`}>
                            <PartyPopper className="w-4 h-4" />
                         </div>
                         <div className="flex-1">
                            <p className={`font-bold ${resolvedIndex >= 3 ? "text-white" : "text-white/40"}`}>Ready for Pickup 🟢</p>
                         </div>
                      </div>
                   </div>
                </div>
            ) : (
                <div className="bg-green-500/5 border border-green-500/20 py-8 mb-8 mt-6">
                   <p className="text-white/60 text-sm font-bold">Skip the queue and head directly to the counter.</p>
                   <p className="text-accent-gold mt-2">Provide Order #{orderNumber}</p>
                </div>
            )}

            {/* Pickup Location Reminder */}
            <div className="flex items-center justify-center gap-3 bg-accent-gold/5 border border-accent-gold/20 px-5 py-4 mb-8 text-left">
                <MapPin className="w-5 h-5 text-accent-gold shrink-0" />
                <p className="text-white/60 text-xs leading-snug">
                    <span className="font-bold text-accent-gold block text-sm mb-0.5">Pickup Location</span>
                    Hazira Rd, near Pal RTO, Adajan, Surat
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-12">
                <Link href="/order" className="block w-full bg-accent-gold text-primary-bg py-4 font-black uppercase tracking-[2px] text-sm hover:scale-[1.02] transition-transform">
                    Order Again
                </Link>
                <Link href="/" className="block w-full border border-white/10 text-white/50 py-3.5 font-bold uppercase tracking-wider text-sm hover:border-white/30 hover:text-white transition-colors">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmedPage() {
    return (
        <div className="min-h-screen bg-primary-bg flex pt-10 md:items-center py-4 relative overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-gold/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <Suspense fallback={<div className="text-accent-gold text-center w-full mt-40">Connecting to Cartel Servers...</div>}>
                <TrackedOrder />
            </Suspense>
        </div>
    );
}
