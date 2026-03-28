"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { BellRing, Check, Clock, Package, CheckCircle2 } from "lucide-react";

type OrderItem = {
    quantity: number;
    special_instructions: string;
    menu_items: { name: string };
};

type Order = {
    id: string;
    customer_name: string;
    customer_phone: string;
    pickup_time: string;
    status: "pending_payment" | "new" | "accepted" | "ready" | "done";
    total_amount: number;
    order_items: OrderItem[];
    created_at: string;
};

const STATUS_COLUMNS = ["new", "accepted", "ready", "done"];

export default function KanbanBoard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isMuted, setIsMuted] = useState(false);

    const playNotification = useCallback(() => {
        if (isMuted) return;
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio block", e);
        }
    }, [isMuted]);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    quantity,
                    special_instructions,
                    menu_items ( name )
                )
            `)
            .neq('status', 'pending_payment')
            .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()) // Today's only
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        if (data) setOrders(data as Order[]);
    };

    useEffect(() => {
        fetchOrders();

        const channel = supabase.channel('orders_channel')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'orders' }, 
                (payload) => {
                    const newOrder = payload.new as Order;
                    if (newOrder.status !== 'pending_payment') {
                        // In reality, new orders come without nested items sometimes via this raw channel 
                        // so we re-fetch all to be safe and populate nested relations
                        playNotification();
                        fetchOrders();
                    }
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                () => {
                    // Refetch to reflect status changes cleanly
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [playNotification]);

    const updateStatus = async (orderId: string, currentStatus: string) => {
        const currentIndex = STATUS_COLUMNS.indexOf(currentStatus);
        if (currentIndex < STATUS_COLUMNS.length - 1) {
            const nextStatus = STATUS_COLUMNS[currentIndex + 1];
            
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus as Order["status"] } : o));

            const { error } = await supabase
                .from('orders')
                .update({ status: nextStatus })
                .eq('id', orderId);

            if (error) {
                console.error("Failed to update status", error);
                fetchOrders(); // Revert
            }
        }
    };

    return (
        <div className="h-full flex flex-col pt-20 px-4 sm:px-6 lg:px-8 pb-8 max-w-[1600px] mx-auto overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight uppercase text-foreground">Live Orders</h1>
                    <p className="text-foreground/40 text-xs font-bold tracking-[2px] uppercase mt-1 text-accent-gold">Kitchen Dashboard</p>
                </div>
                
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${isMuted ? 'border-red-500/50 text-red-500' : 'border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-black'}`}
                >
                    <BellRing size={14} className={isMuted ? "opacity-30" : "animate-pulse"} />
                    {isMuted ? "Sound Off" : "Sound On"}
                </button>
            </div>

            <div className="flex-grow flex gap-6 overflow-x-auto pb-4 items-start snap-x">
                {STATUS_COLUMNS.map((column) => {
                    const columnOrders = orders.filter(o => o.status === column);
                    
                    return (
                        <div key={column} className="min-w-[320px] max-w-[380px] w-full flex-shrink-0 flex flex-col h-[calc(100vh-140px)] bg-card-bg border border-white/5 rounded-sm snap-start">
                            
                            {/* Column Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                                <h2 className="font-display font-black uppercase tracking-[2px] text-lg text-foreground">
                                    {column} 
                                </h2>
                                <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${
                                    column === 'new' ? 'bg-red-500 text-white' :
                                    column === 'accepted' ? 'bg-yellow-500 text-black' :
                                    column === 'ready' ? 'bg-green-500 text-white' :
                                    'bg-white/10 text-white/50'
                                }`}>
                                    {columnOrders.length}
                                </span>
                            </div>

                            {/* Column Body */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {columnOrders.map(order => (
                                    <div key={order.id} className="bg-[#111] border border-white/10 p-5 rounded-sm hover:border-accent-gold/40 transition-colors">
                                        
                                        {/* Order Meta */}
                                        <div className="flex justify-between items-start border-b border-white/5 pb-3">
                                            <div>
                                                <p className="text-foreground font-bold font-body">{order.customer_name}</p>
                                                <p className="text-foreground/40 text-xs font-mono select-all">+{order.customer_phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-accent-gold font-body">₹{order.total_amount}</p>
                                                <p className="text-xs text-foreground/30 mt-0.5">#{order.id.slice(0, 5).toUpperCase()}</p>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="py-3 space-y-2">
                                            {order.order_items?.map((item: OrderItem, idx: number) => (
                                                <div key={idx} className="flex gap-2 items-start text-sm">
                                                    <span className="font-bold text-foreground/40">{item.quantity}x</span>
                                                    <div>
                                                        <span className="font-bold text-foreground/90 font-display tracking-wide">{item.menu_items?.name}</span>
                                                        {item.special_instructions && (
                                                            <span className="block text-accent-gold/70 text-xs font-medium bg-accent-gold/5 mt-0.5 px-1 py-0.5 w-fit">
                                                                * {item.special_instructions}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions & Timing */}
                                        <div className="pt-3 border-t border-white/5 flex gap-3 flex-col mt-2">
                                            <div className="flex justify-between items-center text-xs w-full bg-background border border-white/5 px-3 py-2">
                                                <span className="text-foreground/40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock size={12} className="text-accent-gold" />
                                                    Pickup Time
                                                </span>
                                                <span className="font-bold text-foreground">{format(new Date(order.pickup_time), "h:mm a")}</span>
                                            </div>

                                            {column !== 'done' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, order.status)}
                                                    className={`w-full py-3 flex items-center justify-center gap-2 font-black uppercase tracking-[3px] text-xs transition-colors rounded-sm shadow-md
                                                        ${column === 'new' 
                                                            ? 'bg-accent-gold text-background hover:bg-yellow-400' 
                                                            : column === 'accepted'
                                                                ? 'bg-orange-500 text-white hover:bg-orange-400'
                                                                : 'bg-green-600 text-white hover:bg-green-500'
                                                        }
                                                    `}
                                                >
                                                    {column === 'new' ? (
                                                        <>Accept Order <Check size={14}/></>
                                                    ) : column === 'accepted' ? (
                                                        <>Mark Ready <Package size={14}/></>
                                                    ) : (
                                                        <>Done <CheckCircle2 size={14}/></>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {columnOrders.length === 0 && (
                                    <div className="h-32 flex items-center justify-center border border-dashed border-white/10 text-foreground/20 text-xs font-bold uppercase tracking-[2px]">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
