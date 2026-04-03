"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Edit2, Trash2 } from "lucide-react";
import type { MenuItem } from "@/lib/supabase/types";

interface SortableCategoryListProps {
  items: MenuItem[];
  onReorder: (newItems: MenuItem[]) => void;
  onToggleAvailability: (id: string, currentVal: boolean) => void;
  onTogglePopular: (id: string, currentVal: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
}

export default function SortableCategoryList({
  items,
  onReorder,
  onToggleAvailability,
  onTogglePopular,
  onEdit,
  onDelete,
  onUpdatePrice,
}: SortableCategoryListProps) {
  // Fix for SSR hydration issues with react-beautiful-dnd forks
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;
    
    if (sourceIdx === destIdx) return;

    const newArray = Array.from(items);
    const [moved] = newArray.splice(sourceIdx, 1);
    newArray.splice(destIdx, 0, moved);

    // Update sort_order properties sequentially based on their new index
    const updatedWithSortOrder = newArray.map((item, index) => ({
      ...item,
      sort_order: index + 1 // 1-indexed to keep consistent with Postgres
    }));

    onReorder(updatedWithSortOrder);
  };

  const handlePriceChange = (id: string, val: string) => {
    const price = parseInt(val);
    if (!isNaN(price) && price >= 0) {
      onUpdatePrice(id, price);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="menu-category-list">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="space-y-3"
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-3 p-3 rounded-sm border transition-all ${
                      snapshot.isDragging 
                        ? "bg-primary-bg border-accent-gold shadow-xl rotate-[1deg] scale-[1.01] z-50" 
                        : item.is_available 
                          ? "bg-card-bg border-white/5 hover:border-white/10" 
                          : "bg-card-bg/50 border-white/5 opacity-60"
                    }`}
                  >
                    
                    {/* Drag Handle */}
                    <div 
                      {...provided.dragHandleProps} 
                      className="text-white/20 hover:text-white cursor-grab active:cursor-grabbing p-1"
                    >
                      <GripVertical size={18} />
                    </div>

                    {/* Emoji */}
                    {item.emoji && (
                      <div className="text-xl shrink-0 w-8 text-center">{item.emoji}</div>
                    )}

                    {/* Semantic Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{item.name}</span>
                        {item.code && (
                          <span className="text-[0.65rem] font-bold tracking-widest uppercase text-white/30 bg-primary-bg px-1.5 py-0.5 rounded-sm">
                            {item.code} - {item.label}
                          </span>
                        )}
                        {item.is_popular && (
                          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-black bg-accent-gold px-1.5 py-0.5 rounded-sm">
                            🔥 Popular
                          </span>
                        )}
                      </div>
                      {item.description && (
                         <p className="text-xs text-white/40 truncate mt-0.5 max-w-md">
                           {item.description}
                         </p>
                      )}
                    </div>

                    {/* Controls Cluster */}
                    <div className="flex items-center gap-4 shrink-0 pr-2 border-r border-white/5">
                      
                      {/* Interactive Price Input */}
                      <div className="flex items-center gap-1 group">
                        <span className="text-sm font-bold text-accent-gold/50">₹</span>
                        {['sauce', 'seasoning'].includes(item.category) ? (
                            <span className="text-sm font-black text-white/20 w-12 tracking-wide font-mono">0</span>
                        ) : (
                          <input 
                            type="number"
                            min="0"
                            defaultValue={item.price}
                            onBlur={(e) => {
                              if (parseInt(e.target.value) !== item.price) {
                                handlePriceChange(item.id, e.target.value);
                              }
                            }}
                            className="bg-transparent border-b border-transparent focus:border-accent-gold hover:border-white/20 font-mono text-sm font-black text-accent-gold w-14 focus:outline-none transition-colors"
                          />
                        )}
                      </div>

                      {/* Availability Toggle */}
                      <button 
                        onClick={() => onToggleAvailability(item.id, item.is_available)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${item.is_available ? 'bg-accent-gold' : 'bg-primary-bg border border-white/10'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${item.is_available ? 'bg-black translate-x-5' : 'bg-white/30 translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pl-2">
                       <button onClick={() => onEdit(item)} className="p-2 text-white/30 hover:text-white transition-colors" aria-label="Edit">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => onDelete(item.id)} className="p-2 text-white/30 hover:text-[#ef4444] transition-colors" aria-label="Delete">
                         <Trash2 size={16} />
                       </button>
                    </div>

                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
