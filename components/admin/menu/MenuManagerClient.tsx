"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import SortableCategoryList from "./SortableCategoryList";
import MenuFormModal from "./MenuFormModal";
import { useToast } from "@/components/ui/Toast";
import type { MenuItem, MenuCategory } from "@/lib/supabase/types";

const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: "size", label: "Sizes" },
  { id: "sauce", label: "Sauces" },
  { id: "seasoning", label: "Seasonings" },
  { id: "addon", label: "Add-ons" },
  { id: "drink", label: "Drinks" }
];

export default function MenuManagerClient({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("size");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const { showToast } = useToast();

  const currentCategoryItems = items
    .filter(item => item.category === activeCategory)
    .sort((a, b) => a.sort_order - b.sort_order);

  // --- CRUD Handlers ---

  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Optimistic UI
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: newVal } : i));
    
    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_available: newVal })
      });
      showToast(`${item.name} marked ${newVal ? 'Available' : 'Unavailable'}`);
    } catch {
      // Revert if error
      setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: currentVal } : i));
      showToast("Error updating availability");
    }
  };

  const handleUpdatePrice = async (id: string, newPrice: number) => {
    const item = items.find(i => i.id === id);
    if (!item || item.price === newPrice) return;
    const oldPrice = item.price;

    setItems(prev => prev.map(i => i.id === id ? { ...i, price: newPrice } : i));
    
    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price: newPrice })
      });
      showToast(`Price updated for ${item.name}`);
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, price: oldPrice } : i));
      showToast("Error updating price");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    // Optimistic UI
    const restoredItems = [...items];
    setItems(prev => prev.filter(i => i.id !== id));

    try {
      await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
      showToast("Item deleted");
    } catch {
      setItems(restoredItems);
      showToast("Failed to delete item");
    }
  };

  const handleReorder = async (reorderedItems: MenuItem[]) => {
    // Optimistic UI slice swap
    setItems(prev => {
      const otherItems = prev.filter(i => i.category !== activeCategory);
      return [...otherItems, ...reorderedItems];
    });

    const payload = reorderedItems.map(i => ({ id: i.id, sort_order: i.sort_order }));
    
    try {
      await fetch('/api/menu/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload })
      });
      // Optionally we could showToast("Menu order saved"); but drag is fast, toast might be annoying
    } catch {
      showToast("Network error synchronizing sort order.");
      // We could trigger a full refetch here on failure for safety
    }
  };

  const handleBatchToggle = async (availability: boolean) => {
    if (!confirm(`Are you sure you want to mark ALL ${activeCategory} items as ${availability ? 'Available' : 'Unavailable'}?`)) return;

    const modifiedItems = currentCategoryItems.map(i => ({ ...i, is_available: availability }));
    
    // Optimistic update
    setItems(prev => prev.map(i => i.category === activeCategory ? { ...i, is_available: availability } : i));

    try {
      await Promise.all(modifiedItems.map(item => 
        fetch('/api/menu', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, is_available: availability })
        })
      ));
      showToast(`Batch toggle successful`);
    } catch {
      showToast("An error occurred during batch update.");
    }
  };

  // --- Modal Form Actions ---

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: Partial<MenuItem>) => {
    setIsModalOpen(false);
    showToast("Processing...");

    try {
      if (editingItem) {
        // PATCH
        const res = await fetch('/api/menu', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, ...formData })
        });
        const { data } = await res.json();
        if (data) setItems(prev => prev.map(i => i.id === data.id ? data : i));
        showToast("Item updated successfully");
      } else {
        // POST
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, category: activeCategory })
        });
        const { data } = await res.json();
        if (data) setItems(prev => [...prev, data]);
        showToast("Item created successfully");
      }
    } catch {
      showToast("Network error. Please try again.");
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-4 md:pt-8 md:px-8 overflow-hidden h-full">
      
      {/* Category Tabs Strip */}
      <div className="flex overflow-x-auto border-b border-white/10 shrink-0 custom-scrollbar-hide px-4 md:px-0">
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat.id).length;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 relative ${
                isActive ? "text-accent-gold" : "text-white/40 hover:text-white/80"
              }`}
            >
              {cat.label} <span className="opacity-50 ml-1 text-[0.6rem]">({count})</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent-gold" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-6">
        
        {/* Quick Actions Strip */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleBatchToggle(true)}
              className="text-[0.6rem] uppercase tracking-widest font-bold text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1.5 rounded-sm hover:bg-[#34d399]/20 transition-colors"
            >
              Mark All Available
            </button>
            <button 
              onClick={() => handleBatchToggle(false)}
              className="text-[0.6rem] uppercase tracking-widest font-bold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-3 py-1.5 rounded-sm hover:bg-[#ef4444]/20 transition-colors"
            >
              Mark All Unavailable
            </button>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-accent-gold text-black px-4 py-2 text-xs font-black uppercase tracking-widest rounded-sm hover:bg-white transition-colors"
          >
            <Plus size={16} /> Add {activeCategory}
          </button>
        </div>

        {/* Drag and Drop Interactive List */}
        {currentCategoryItems.length === 0 ? (
          <div className="h-40 flex items-center justify-center border border-white/5 border-dashed rounded-sm">
            <p className="text-white/30 text-xs font-bold tracking-widest uppercase">No items in this category.</p>
          </div>
        ) : (
          <SortableCategoryList 
            items={currentCategoryItems} 
            onReorder={handleReorder}
            onToggleAvailability={handleToggleAvailability}
            onTogglePopular={(id, val) => handleModalSubmit({ id, is_popular: !val } as Partial<MenuItem>)} // HACK: reusing modal submit for quick flag
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onUpdatePrice={handleUpdatePrice}
          />
        )}
        
      </div>

      {/* Modals Container */}
      <MenuFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        category={activeCategory}
        editingItem={editingItem}
      />
    </div>
  );
}
