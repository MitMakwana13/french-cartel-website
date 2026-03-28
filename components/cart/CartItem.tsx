import { X, Minus, Plus } from "lucide-react";
import { useCartStore, CartItem as CartItemType } from "@/store/useCartStore";
import Image from "next/image";

export default function CartItem({ item }: { item: CartItemType }) {
    const { updateQuantity, removeItem } = useCartStore();

    return (
        <div className="flex gap-4 py-4 border-b border-white/5">
            <div className="w-20 h-20 bg-card-bg rounded-sm relative overflow-hidden flex-shrink-0">
                {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-xs text-text-muted">
                        No Image
                    </div>
                )}
            </div>

            <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-display text-lg uppercase leading-tight">{item.name}</h4>
                        <p className="text-accent-gold font-bold text-sm">₹{item.price}</p>
                    </div>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                    >
                        <X size={18} />
                    </button>
                </div>

                {item.special_instructions && (
                    <p className="text-xs text-text-muted mt-1 italic w-full truncate">
                        Note: {item.special_instructions}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 bg-card-bg flex items-center justify-center rounded-sm hover:bg-accent-gold hover:text-black transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 bg-card-bg flex items-center justify-center rounded-sm hover:bg-accent-gold hover:text-black transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
