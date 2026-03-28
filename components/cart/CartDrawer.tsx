"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import CartItem from "./CartItem";
import Link from "next/link";

export default function CartDrawer() {
    const { isDrawerOpen, closeDrawer, items, getCartTotal, getCartCount } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isDrawerOpen]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-white/10 z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="font-display text-2xl uppercase tracking-wider flex items-center gap-3">
                                <ShoppingBag className="text-accent-gold" />
                                Your Order
                                <span className="bg-card-bg text-sm px-2 py-1 rounded text-text-muted ml-2">
                                    {getCartCount()}
                                </span>
                            </h2>
                            <button
                                onClick={closeDrawer}
                                className="text-text-muted hover:text-white transition-colors"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-grow overflow-y-auto px-6 hide-scrollbar flex flex-col pt-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-grow opacity-50 space-y-4">
                                    <ShoppingBag size={48} className="text-text-muted" />
                                    <p className="font-display text-xl uppercase tracking-widest text-text-muted text-center">
                                        Your bowl is empty
                                    </p>
                                    <button 
                                        onClick={closeDrawer}
                                        className="text-accent-gold uppercase tracking-wider border-b border-accent-gold text-sm font-bold"
                                    >
                                        Start Ordering
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => <CartItem key={item.id} item={item} />)
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-card-bg mt-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-text-muted uppercase tracking-wider font-bold">Subtotal</span>
                                    <span className="font-display text-2xl text-accent-gold">₹{getCartTotal()}</span>
                                </div>
                                <Link
                                    href="/checkout"
                                    onClick={closeDrawer}
                                    className="w-full block text-center bg-accent-gold text-background py-4 font-display text-xl uppercase tracking-widest font-black hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
