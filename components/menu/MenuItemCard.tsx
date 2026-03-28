"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export interface MenuItemProps {
    id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_sold_out: boolean;
}

export default function MenuItemCard({ item }: { item: MenuItemProps }) {
    const { addItem } = useCartStore();
    const [isAdded, setIsAdded] = useState(false);
    const [instructions, setInstructions] = useState("");

    const handleAdd = () => {
        if (item.is_sold_out) return;
        
        addItem({
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image_url: item.image_url,
            special_instructions: instructions.trim() || undefined,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset after 2s
        setInstructions("");
    };

    return (
        <div className="bg-[#151515] border border-white/5 rounded-sm overflow-hidden group hover:border-accent-gold/30 transition-all duration-300 flex flex-col h-full">
            <div className="relative h-48 sm:h-56 w-full cursor-pointer overflow-hidden">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${item.is_sold_out ? 'grayscale opacity-70' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center text-text-muted">
                        <span className="font-display tracking-[5px] uppercase text-xs opacity-50">No Image</span>
                    </div>
                )}
                
                {item.is_sold_out && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="text-white font-black font-display tracking-[4px] uppercase border-2 border-white px-4 py-2 rotate-[-10deg]">Sold Out</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-display font-bold text-xl uppercase tracking-wider text-foreground leading-tight">
                        {item.name}
                    </h3>
                    <span className="font-bold text-accent-gold text-lg whitespace-nowrap">₹{item.price}</span>
                </div>
                
                <p className="text-foreground/50 text-sm font-body line-clamp-2 mb-4">
                    {item.description}
                </p>

                <div className="mt-auto space-y-3">
                    <input 
                        type="text" 
                        placeholder="Special instructions? (Optional)"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        disabled={item.is_sold_out}
                        className="w-full bg-[#111] border border-white/10 text-xs px-3 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent-gold/50 transition-colors disabled:opacity-50"
                    />

                    <button
                        onClick={handleAdd}
                        disabled={item.is_sold_out}
                        className={`w-full flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-[2px] text-sm transition-all duration-300 ${
                            item.is_sold_out 
                                ? "bg-[#111] text-foreground/30 cursor-not-allowed" 
                                : isAdded 
                                    ? "bg-green-600 text-white" 
                                    : "bg-background border border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-black"
                        }`}
                    >
                        {isAdded ? (
                            <>
                                <Check size={16} /> Added
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
