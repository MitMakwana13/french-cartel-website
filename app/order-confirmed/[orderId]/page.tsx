import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Clock, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({
    params,
}: {
    params: { orderId: string };
}) {
    // Note: Next.js 14 params are implicitly available on await, wait, Next 14 handles simple params directly.
    const { orderId } = params;

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                quantity,
                unit_price,
                special_instructions,
                menu_items (
                    name
                )
            )
        `)
        .eq('id', orderId)
        .single();

    if (error || !order) {
        redirect('/');
    }

    return (
        <main className="bg-background min-h-screen pt-32 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card-bg border border-white/5 p-8 md:p-12 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 blur-[80px] pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent" />

                    <div className="relative z-10 text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-gold/10 mb-6 border border-accent-gold/30 shadow-[0_0_30px_rgba(201,168,76,0.2)] animate-fade-in-up">
                            <CheckCircle2 className="w-10 h-10 text-accent-gold" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-foreground uppercase tracking-tight mb-4">
                            Order <span className="text-accent-gold italic">Confirmed</span>
                        </h1>
                        <p className="text-foreground/60 font-body text-lg">
                            Thank you, {order.customer_name}. The Cartel has your order.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-[#111] border border-white/5 p-6 rounded-sm">
                            <div className="flex items-center gap-3 text-accent-gold mb-3">
                                <Clock size={20} />
                                <h3 className="font-display font-black uppercase tracking-[2px] text-sm">Pickup Time</h3>
                            </div>
                            <p className="text-2xl font-bold font-body text-foreground">
                                {format(new Date(order.pickup_time), "h:mm a")}
                            </p>
                            <p className="text-foreground/40 text-xs mt-2 uppercase tracking-wider font-bold">Today</p>
                        </div>

                        <div className="bg-[#111] border border-white/5 p-6 rounded-sm">
                            <div className="flex items-center gap-3 text-accent-gold mb-3">
                                <MapPin size={20} />
                                <h3 className="font-display font-black uppercase tracking-[2px] text-sm">Pickup Location</h3>
                            </div>
                            <p className="text-sm font-bold font-body text-foreground leading-relaxed">
                                Hazira Rd, near Pal RTO,<br />
                                opp. Sangini Aspire
                            </p>
                            <p className="text-foreground/40 text-xs mt-2 uppercase tracking-wider font-bold">Surat, Gujarat</p>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 mb-10">
                        <h3 className="font-display font-black text-foreground uppercase tracking-[3px] mb-6">Order Details</h3>
                        <div className="space-y-4">
                            {order.order_items.map((item: { 
                                quantity: number; 
                                unit_price: number; 
                                special_instructions?: string;
                                menu_items: { name: string } | null;
                            }, i: number) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <span className="text-foreground/40 font-bold">{item.quantity}x</span>
                                        <div>
                                            <p className="font-bold text-foreground font-body">{item.menu_items?.name}</p>
                                            {item.special_instructions && (
                                                <p className="text-accent-gold/80 text-xs italic mt-1 font-medium bg-accent-gold/5 inline-block px-1">Note: {item.special_instructions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-bold text-foreground">₹{item.unit_price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-accent-gold/20 pt-4 mt-6 flex justify-between items-center">
                            <span className="font-bold uppercase tracking-[2px] text-foreground/60 text-sm">Total Paid</span>
                            <span className="text-2xl font-black font-display text-accent-gold">₹{order.total_amount}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="text-sm text-foreground/50 max-w-sm mb-2">Show this screen or quote your name at the counter when picking up.</p>
                        <Link 
                            href="/"
                            className="text-accent-gold font-bold uppercase tracking-[3px] text-sm hover:text-white transition-colors underline decoration-accent-gold/30 underline-offset-4"
                        >
                            Return to Home
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
