"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Power } from "lucide-react";

type MenuItem = {
    id: string;
    name: string;
    price: number;
    is_sold_out: boolean;
    category_id: string;
};

export default function MenuManager() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error(error);
        } else {
            setItems(data as MenuItem[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const toggleSoldOut = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setItems(prev => prev.map(item => item.id === id ? { ...item, is_sold_out: !currentStatus } : item));

        const { error } = await supabase
            .from('menu_items')
            .update({ is_sold_out: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error(error);
            fetchItems(); // revert on error
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-16">
            <div className="mb-10 text-center animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase text-foreground">
                    Menu <span className="text-accent-gold italic">Manager</span>
                </h1>
                <p className="text-foreground/40 text-xs tracking-[3px] uppercase mt-3 font-bold">Toggle Item Status</p>
            </div>

            <div className="bg-card-bg border border-white/5 shadow-2xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="grid grid-cols-[1fr,auto] gap-4 p-4 border-b border-white/10 bg-[#111] text-foreground/40 text-xs font-bold uppercase tracking-[2px]">
                    <div>Item Name</div>
                    <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {items.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr,auto] gap-4 p-4 md:p-6 items-center hover:bg-white/[0.02] transition-colors">
                            <div>
                                <h3 className={`font-display font-bold text-lg tracking-wide ${item.is_sold_out ? 'text-foreground/40 line-through' : 'text-foreground'}`}>
                                    {item.name}
                                </h3>
                                <p className="text-accent-gold font-bold font-body text-sm mt-1">₹{item.price}</p>
                            </div>

                            <button
                                onClick={() => toggleSoldOut(item.id, item.is_sold_out)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-sm font-black uppercase tracking-[2px] text-xs transition-all duration-300 border ${
                                    item.is_sold_out
                                        ? "bg-[#111] border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                                        : "bg-accent-gold border-accent-gold text-background hover:bg-yellow-400"
                                }`}
                            >
                                <Power size={14} />
                                {item.is_sold_out ? "Sold Out" : "Active"}
                            </button>
                        </div>
                    ))}
                    
                    {items.length === 0 && (
                        <div className="p-10 text-center text-foreground/40 font-body">
                            No menu items found. Please add them via Supabase Dashboard.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
