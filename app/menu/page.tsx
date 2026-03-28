import { supabase } from "@/lib/supabase";
import MenuClient from "@/components/menu/MenuClient";

export const dynamic = "force-dynamic";
export const revalidate = 60; // 60 seconds

export default async function MenuPage() {
    // 1. Fetch categories
    const { data: categoriesData } = await supabase
        .from("menu_categories")
        .select("*")
        .order("sort_order", { ascending: true });

    // 2. Fetch all active items
    const { data: itemsData } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });

    const categories = categoriesData || [];
    const items = itemsData || [];

    // Temporary Fallback Data if DB is entirely empty, purely so the page isn't blank on first boot for the user!
    const _categories = categories.length > 0 ? categories : [
        { id: "cat_1", name: "Loaded Fries", sort_order: 1 },
        { id: "cat_2", name: "Drinks", sort_order: 2 },
    ];
    
    const _items = items.length > 0 ? items : [
        { 
            id: "item_1", category_id: "cat_1", name: "Spicy Chipotle Fries", price: 299, 
            description: "Signature french fries overloaded with smoky chipotle sauce, melted cheese, and fresh jalapeños.", 
            is_sold_out: false, sort_order: 1 
        },
        { 
            id: "item_2", category_id: "cat_1", name: "Tangy Tandoori Fries", price: 289, 
            description: "Crispy fries tossed in our secret tandoori masala, topped with mint mayo and onions.", 
            is_sold_out: false, sort_order: 2 
        },
        { 
            id: "item_3", category_id: "cat_2", name: "Classic Mint Mojito", price: 149, 
            description: "Refreshing house-made mint mojito to balance the heat.", 
            is_sold_out: false, sort_order: 1 
        },
    ];

    return (
        <main className="bg-background min-h-screen pt-28 overflow-x-hidden">

            {/* ── PAGE HEADER ── */}
            <section className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.15)_0%,_transparent_60%)] pointer-events-none" />
                <div className="relative z-10 animate-fade-in-up">
                    <p className="text-accent-gold uppercase tracking-[6px] text-xs font-bold mb-4 font-body">French Cartel</p>
                    <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none mb-4 text-foreground">
                        The <span className="text-accent-gold italic">Menu</span>
                    </h1>
                    <p className="text-foreground/40 text-lg tracking-[5px] uppercase mt-4 font-bold font-body">Pick Your Poison</p>
                </div>
            </section>

            {/* ── MENU CLIENT CONTAINER (FILTERS & GRID) ── */}
            <MenuClient categories={_categories} items={_items} />

            {/* ── DIVIDER ── */}
            <div className="h-[1px] w-full max-w-5xl mx-auto bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent my-10" />

        </main>
    );
}
