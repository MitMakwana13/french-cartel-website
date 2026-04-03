"use client";

import { useState } from "react";
import { X, MessageCircle, Copy, AlertTriangle } from "lucide-react";
import type { Order, RejectionCategory } from "@/lib/supabase/types";
import { useToast } from "@/components/ui/Toast";

// ── Preset reasons ─────────────────────────────────────────────────────────
interface Preset {
  emoji: string;
  label: string;
  category: RejectionCategory;
  getReason: (order: Order) => string;
  canAutoStock: boolean;
  getStockHint: (order: Order) => string;
}

const PRESETS: Preset[] = [
  {
    emoji: "🍟",
    label: "Size sold out",
    category: "out_of_stock",
    getReason: (o) => `Sorry, the ${o.items?.size?.name || "selected"} size is currently sold out.`,
    canAutoStock: true,
    getStockHint: (o) => `Mark "${o.items?.size?.name}" as out of stock?`,
  },
  {
    emoji: "🌶️",
    label: "Sauce unavailable",
    category: "item_unavailable",
    getReason: (o) => `Sorry, one of your selected sauces (${(o.items?.sauces || []).slice(0, 1).join("") || "sauce"}) is unavailable right now.`,
    canAutoStock: true,
    getStockHint: (o) => `Mark the sauce as out of stock?`,
  },
  {
    emoji: "🔥",
    label: "Too many orders",
    category: "too_busy",
    getReason: () => "Sorry, we're swamped right now! Please try again in 15–20 minutes. 🙏",
    canAutoStock: false,
    getStockHint: () => "",
  },
  {
    emoji: "⏰",
    label: "Closing soon",
    category: "closing_soon",
    getReason: () => "Sorry, we're closing soon and can't take new orders right now.",
    canAutoStock: false,
    getStockHint: () => "",
  },
  {
    emoji: "❌",
    label: "Other reason",
    category: "other",
    getReason: () => "",
    canAutoStock: false,
    getStockHint: () => "",
  },
];

// ── Props ──────────────────────────────────────────────────────────────────
interface RejectionModalProps {
  order: Order;
  onConfirm: (payload: {
    rejection_reason: string;
    rejection_category: RejectionCategory;
    auto_mark_out_of_stock: boolean;
    out_of_stock_item_id?: string;
  }) => void;
  onClose: () => void;
}

// ── Components ─────────────────────────────────────────────────────────────
export default function RejectionModal({ order, onConfirm, onClose }: RejectionModalProps) {
  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [autoStock, setAutoStock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWa, setShowWa] = useState(false);

  const items = order.items;
  const sizeName = items?.size?.name || "Unknown";
  const waNumber = order.customer_phone.replace(/\D/g, "");

  // Final reason
  const reason =
    selectedPreset?.category === "other" || !selectedPreset
      ? customReason.trim()
      : customReason.trim()
      ? customReason.trim()
      : selectedPreset.getReason(order);

  const canSubmit = !!selectedPreset && (selectedPreset.category === "other" ? customReason.trim().length > 0 : true) && !submitting;

  const waMessage = encodeURIComponent(
    `Hey ${order.customer_name}! 😔\n\nUnfortunately, we had to cancel your French Cartel order #${order.order_number}.\n\nReason: ${reason || "We couldn't process your order at this time."}\n\nYour payment of ₹${order.total_price} will be refunded automatically within 3–5 business days.\n\nSorry about this! We hope to serve you next time. 🍟\n\n— Team French Cartel`
  );
  const waUrl = `https://wa.me/91${waNumber}?text=${waMessage}`;
  const copyableMessage = decodeURIComponent(waMessage);

  // Figure out which menu item to mark OOS
  const oosItemId = selectedPreset?.category === "out_of_stock"
    ? undefined // size items don't have a direct ID in the order, admin uses Quick Stock
    : undefined;

  const handleSubmit = async () => {
    if (!selectedPreset || !reason) return;
    setSubmitting(true);
    await onConfirm({
      rejection_reason: reason,
      rejection_category: selectedPreset.category,
      auto_mark_out_of_stock: autoStock,
      out_of_stock_item_id: oosItemId,
    });
    setShowWa(true);
    setSubmitting(false);
  };

  const copyMsg = () => {
    navigator.clipboard.writeText(copyableMessage);
    showToast("Message copied to clipboard! 📋");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm" onClick={!showWa ? onClose : undefined} />

      {/* Bottom sheet / panel */}
      <div className="fixed z-[100] bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-[520px] bg-[#111] border border-[#ef4444]/20 shadow-[0_-4px_40px_rgba(239,68,68,0.15)] md:shadow-[0_8px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] md:max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ef4444]/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-[#ef4444]" />
            </div>
            <div>
              <h2 className="text-white font-black text-sm uppercase tracking-widest">
                Reject Order <span className="text-[#ef4444]">#{order.order_number}</span>
              </h2>
              <p className="text-white/30 text-[0.6rem] mt-0.5">{order.customer_name} · ₹{order.total_price}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!showWa ? (
            <div className="p-5 space-y-5">
              {/* Order Summary */}
              <div className="bg-[#0a0a0a] border border-white/5 px-4 py-3 text-xs text-white/50 space-y-1">
                <p><span className="text-white/30">Size:</span> <span className="text-white font-bold">{sizeName}</span></p>
                {items?.sauces?.length > 0 && <p><span className="text-white/30">Sauces:</span> {items.sauces.join(", ")}</p>}
                {items?.addons?.length > 0 && <p><span className="text-white/30">Addons:</span> {items.addons.map((a: any) => a.name).join(", ")}</p>}
              </div>

              {/* Preset reason chips */}
              <div>
                <p className="text-white/30 text-[0.6rem] uppercase tracking-[2.5px] font-black mb-3">Select Reason</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => {
                    const active = selectedPreset?.label === preset.label;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setSelectedPreset(preset);
                          // Pre-fill reason unless "Other"
                          if (preset.category !== "other") {
                            setCustomReason(preset.getReason(order));
                          } else {
                            setCustomReason("");
                          }
                          setAutoStock(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-4 border text-sm font-bold text-left transition-colors min-h-[56px]
                          ${active
                            ? "border-[#ef4444]/50 bg-[#ef4444]/10 text-white"
                            : "border-white/8 bg-[#0a0a0a] text-white/50 hover:text-white hover:border-white/20"
                          }`}
                      >
                        <span className="text-xl shrink-0">{preset.emoji}</span>
                        <span className="text-xs leading-tight">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom reason field */}
              {selectedPreset && (
                <div>
                  <p className="text-white/30 text-[0.6rem] uppercase tracking-[2.5px] font-black mb-2">
                    {selectedPreset.category === "other" ? "Custom Reason (required)" : "Customize message"}
                  </p>
                  <textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    maxLength={200}
                    placeholder="Tell the customer why..."
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#ef4444]/50 resize-none placeholder-white/20"
                  />
                  <p className="text-white/20 text-[0.6rem] text-right mt-1">{customReason.length}/200</p>
                </div>
              )}

              {/* Auto stock toggle */}
              {selectedPreset?.canAutoStock && (
                <label className="flex items-start gap-3 bg-amber-400/5 border border-amber-400/15 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoStock}
                    onChange={(e) => setAutoStock(e.target.checked)}
                    className="mt-0.5 accent-amber-400"
                  />
                  <div>
                    <p className="text-amber-400 text-xs font-bold">{selectedPreset.getStockHint(order)}</p>
                    <p className="text-white/30 text-[0.6rem] mt-0.5">Updates Quick Stock panel automatically</p>
                  </div>
                </label>
              )}
            </div>
          ) : (
            /* WhatsApp send step */
            <div className="p-5 space-y-4">
              <div className="bg-green-400/5 border border-green-400/15 px-4 py-3">
                <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">✅ Order Rejected</p>
                <p className="text-white/40 text-xs">Now notify the customer on WhatsApp.</p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 px-4 py-3">
                <p className="text-white/30 text-[0.6rem] uppercase tracking-[2px] font-bold mb-2">Preview Message</p>
                <p className="text-white/70 text-xs leading-relaxed whitespace-pre-line font-mono">
                  {copyableMessage.slice(0, 320)}{copyableMessage.length > 320 ? "…" : ""}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/80 text-black font-black uppercase tracking-widest text-xs py-3.5 transition-colors"
                >
                  <MessageCircle size={14} /> Send WhatsApp
                </a>
                <button
                  onClick={copyMsg}
                  className="px-4 flex items-center gap-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full text-white/20 hover:text-white text-xs font-bold uppercase py-2 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!showWa && (
          <div className="px-5 pb-5 shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-colors
                ${canSubmit
                  ? "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
            >
              {submitting ? "Rejecting..." : "Reject & Notify Customer"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
