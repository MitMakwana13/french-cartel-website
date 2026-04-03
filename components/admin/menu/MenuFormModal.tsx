"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { MenuItem, MenuCategory } from "@/lib/supabase/types";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Partial<MenuItem>) => void;
  category: MenuCategory;
  editingItem: MenuItem | null;
}

export default function MenuFormModal({ isOpen, onClose, onSubmit, category, editingItem }: MenuFormModalProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({});

  // Reset or initialize form data based on editingItem and category
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({ ...editingItem });
      } else {
        // Defaults based on category
        setFormData({
          category,
          price: ['sauce', 'seasoning'].includes(category) ? 0 : '',
          is_available: true,
          is_popular: false
        } as Partial<MenuItem>);
      }
    }
  }, [isOpen, editingItem, category]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof MenuItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Determine which fields to show based on category
  const showCodeLabel = category === 'size';
  const showPrice = !['sauce', 'seasoning'].includes(category);
  const showDesc = ['size', 'sauce', 'seasoning'].includes(category);
  const showPopular = category === 'size';
  const showEmoji = category !== 'size';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-primary-bg/80 backdrop-blur-sm">
      <div className="bg-card-bg border border-white/10 rounded-sm w-full max-w-md shadow-2xl animate-fade-in-up">
        
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-xl font-display italic font-black text-accent-gold">
            {editingItem ? 'Edit Item' : `Add New ${category}`}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="space-y-1">
            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Name</label>
            <input 
              type="text" 
              required
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-primary-bg border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-gold focus:outline-none transition-colors"
              placeholder="e.g. MegaBite"
            />
          </div>

          {showEmoji && (
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Emoji</label>
              <input 
                type="text" 
                value={formData.emoji || ''}
                onChange={(e) => updateField('emoji', e.target.value)}
                className="w-full bg-primary-bg border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-gold focus:outline-none transition-colors"
                placeholder="e.g. 🧀"
              />
            </div>
          )}

          {showCodeLabel && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Code</label>
                <input 
                  type="text" 
                  value={formData.code || ''}
                  onChange={(e) => updateField('code', e.target.value)}
                  className="w-full bg-primary-bg border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-gold focus:outline-none uppercase"
                  placeholder="e.g. MB"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Label</label>
                <input 
                  type="text" 
                  value={formData.label || ''}
                  onChange={(e) => updateField('label', e.target.value)}
                  className="w-full bg-primary-bg border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-gold focus:outline-none"
                  placeholder="e.g. Medium"
                />
              </div>
            </div>
          )}

          {showPrice && (
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Price (₹)</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.price ?? ''}
                onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                className="w-full bg-primary-bg border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-gold focus:outline-none font-medium"
              />
            </div>
          )}

          {showDesc && (
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Description</label>
              <textarea 
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full bg-primary-bg border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-gold focus:outline-none resize-none h-20"
                placeholder="Optional description..."
              />
            </div>
          )}

          {showPopular && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <input 
                type="checkbox" 
                id="popular-toggle"
                checked={formData.is_popular || false}
                onChange={(e) => updateField('is_popular', e.target.checked)}
                className="w-4 h-4 accent-accent-gold cursor-pointer"
              />
              <label htmlFor="popular-toggle" className="text-sm font-bold text-white/80 cursor-pointer">
                Mark as Most Popular
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-white/5">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-white/50 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-accent-gold text-black py-3 text-xs font-black uppercase tracking-widest rounded-sm hover:bg-white transition-colors"
            >
              {editingItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
