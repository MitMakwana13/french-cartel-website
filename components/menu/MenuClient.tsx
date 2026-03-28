"use client";

import { useState } from "react";
import MenuItemCard, { MenuItemProps } from "./MenuItemCard";

interface MenuCategory {
    id: string;
    name: string;
    sort_order: number;
}

interface MenuClientProps {
    categories: MenuCategory[];
    items: MenuItemProps[];
}

export default function MenuClient({ categories, items }: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // Filter items based on active category
    const filteredItems = activeCategory === "all" 
        ? items 
        : items.filter(item => {
            return item.category_id === activeCategory;
        });

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`px-8 py-3 text-sm font-bold uppercase tracking-[3px] font-display transition-all duration-300 ${
                            activeCategory === "all"
                                ? "bg-accent-gold text-background shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                                : "bg-card-bg border border-white/5 text-foreground/50 hover:border-accent-gold/50 hover:text-accent-gold"
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-8 py-3 text-sm font-bold uppercase tracking-[3px] font-display transition-all duration-300 ${
                                activeCategory === cat.id
                                    ? "bg-accent-gold text-background shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                                    : "bg-card-bg border border-white/5 text-foreground/50 hover:border-accent-gold/50 hover:text-accent-gold"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <MenuItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-foreground/40 text-lg font-body">No items found in this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
