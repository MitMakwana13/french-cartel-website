"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import type { MenuItem, MenuCategory } from "@/lib/supabase/types";
import { formatAvailableDays } from "@/lib/menu-availability";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Partial<MenuItem>) => void;
  category: MenuCategory;
  editingItem: MenuItem | null;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CUSTOMER_LABEL_PRESETS = [
  "New!",
  "Popular",
  "Chef's Pick",
  "Weekend Special",
  "Weekend Only",
  "Limited Edition",
  "Seasonal",
  "Back by Demand",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[0.65rem] font-black uppercase tracking-widest text-white/40">{label}</label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full bg-[#0a0a0a] border border-white/10 px-3 py-2.5 text-white text-sm focus:border-[#f5c518] focus:outline-none transition-colors";

export default function MenuFormModal({
  isOpen, onClose, onSubmit, category, editingItem,
}: MenuFormModalProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasTimeRestriction, setHasTimeRestriction] = useState(false);
  const [hasDailyLimit, setHasDailyLimit] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [labelMode, setLabelMode] = useState<"preset" | "custom" | "none">("none");

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({ ...editingItem });
        setHasTimeRestriction(!!(editingItem.available_from || editingItem.available_until));
        setHasDailyLimit(editingItem.daily_limit != null);
        if (editingItem.customer_label) {
          if (CUSTOMER_LABEL_PRESETS.includes(editingItem.customer_label)) {
            setLabelMode("preset");
          } else {
            setLabelMode("custom");
            setCustomLabel(editingItem.customer_label);
          }
        } else {
          setLabelMode("none");
          setCustomLabel("");
        }
      } else {
        setFormData({
          category,
          price: ["sauce", "seasoning"].includes(category) ? 0 : (undefined as any),
          is_available: true,
          is_popular: false,
          stock_status: "in_stock",
          available_days: [0, 1, 2, 3, 4, 5, 6],
        } as Partial<MenuItem>);
        setHasTimeRestriction(false);
        setHasDailyLimit(false);
        setLabelMode("none");
        setCustomLabel("");
      }
      setShowAdvanced(false);
    }
  }, [isOpen, editingItem, category]);

  if (!isOpen) return null;

  const updateField = (field: keyof MenuItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: number) => {
    const current: number[] = (formData.available_days as number[]) ?? ALL_DAYS;
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort();
    updateField("available_days", updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<MenuItem> = { ...formData };

    // Finalize customer_label
    if (labelMode === "none") payload.customer_label = null;
    else if (labelMode === "custom") payload.customer_label = customLabel.slice(0, 20) || null;
    // preset label is already in formData.customer_label

    // Clear time restriction if disabled
    if (!hasTimeRestriction) {
      payload.available_from = null;
      payload.available_until = null;
    }

    // Clear daily limit if disabled
    if (!hasDailyLimit) {
      payload.daily_limit = null;
    }

    onSubmit(payload);
  };

  const showCodeLabel = category === "size";
  const showPrice = !["sauce", "seasoning"].includes(category);
  const showDesc = ["size", "sauce", "seasoning"].includes(category);
  const showPopular = category === "size";
  const showEmoji = category !== "size";

  const selectedDays: number[] = (formData.available_days as number[]) ?? ALL_DAYS;
  const daysSummary = formatAvailableDays(selectedDays);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-display italic font-black text-[#f5c518]">
            {editingItem ? "Edit Item" : `Add New ${category}`}
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

            {/* ── Core Fields ── */}
            <Field label="Name">
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                className={INPUT}
                placeholder="e.g. MegaBite"
              />
            </Field>

            {showEmoji && (
              <Field label="Emoji">
                <input
                  type="text"
                  value={formData.emoji || ""}
                  onChange={(e) => updateField("emoji", e.target.value)}
                  className={INPUT}
                  placeholder="e.g. 🧀"
                />
              </Field>
            )}

            {showCodeLabel && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Size Code">
                  <input
                    type="text"
                    value={formData.code || ""}
                    onChange={(e) => updateField("code", e.target.value)}
                    className={`${INPUT} uppercase`}
                    placeholder="e.g. MB"
                  />
                </Field>
                <Field label="Size Label">
                  <input
                    type="text"
                    value={formData.label || ""}
                    onChange={(e) => updateField("label", e.target.value)}
                    className={INPUT}
                    placeholder="e.g. Medium"
                  />
                </Field>
              </div>
            )}

            {showPrice && (
              <Field label="Price (₹)">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price ?? ""}
                  onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
                  className={INPUT}
                />
              </Field>
            )}

            {showDesc && (
              <Field label="Description">
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${INPUT} resize-none h-16`}
                  placeholder="Optional description..."
                />
              </Field>
            )}

            {showPopular && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_popular || false}
                  onChange={(e) => updateField("is_popular", e.target.checked)}
                  className="w-4 h-4 accent-[#f5c518]"
                />
                <span className="text-sm font-bold text-white/70">Mark as Most Popular</span>
              </label>
            )}

            {/* ── Advanced Section ── */}
            <div className="border border-white/5 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-white/50 hover:text-white transition-colors"
              >
                <span className="text-xs font-black uppercase tracking-widest">⚙ Advanced Availability</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAdvanced && (
                <div className="px-4 pb-4 space-y-5 border-t border-white/5">

                  {/* Day selector */}
                  <div className="pt-4">
                    <p className="text-white/40 text-[0.6rem] uppercase tracking-[2px] font-black mb-2">
                      Available Days · <span className="text-[#f5c518]">{daysSummary}</span>
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAY_LABELS.map((day, i) => {
                        const active = selectedDays.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`w-10 h-10 text-xs font-black border transition-colors
                              ${active
                                ? "border-[#f5c518] bg-[#f5c518]/10 text-[#f5c518]"
                                : "border-white/10 text-white/30 hover:text-white/60"
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => updateField("available_days", ALL_DAYS)}
                        className="text-[0.6rem] text-white/30 hover:text-[#f5c518] uppercase tracking-wider font-bold transition-colors">
                        All
                      </button>
                      <button type="button" onClick={() => updateField("available_days", [5, 6, 0])}
                        className="text-[0.6rem] text-white/30 hover:text-[#f5c518] uppercase tracking-wider font-bold transition-colors">
                        Fri–Sun
                      </button>
                      <button type="button" onClick={() => updateField("available_days", [6, 0])}
                        className="text-[0.6rem] text-white/30 hover:text-[#f5c518] uppercase tracking-wider font-bold transition-colors">
                        Weekends
                      </button>
                      <button type="button" onClick={() => updateField("available_days", [1, 2, 3, 4, 5])}
                        className="text-[0.6rem] text-white/30 hover:text-[#f5c518] uppercase tracking-wider font-bold transition-colors">
                        Weekdays
                      </button>
                    </div>
                  </div>

                  {/* Time restriction */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={hasTimeRestriction}
                        onChange={(e) => setHasTimeRestriction(e.target.checked)}
                        className="accent-[#f5c518]"
                      />
                      <span className="text-xs font-bold text-white/60">Restrict to specific hours?</span>
                    </label>
                    {hasTimeRestriction && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Available From">
                          <input
                            type="time"
                            value={formData.available_from || ""}
                            onChange={(e) => updateField("available_from", e.target.value)}
                            className={INPUT}
                          />
                        </Field>
                        <Field label="Available Until">
                          <input
                            type="time"
                            value={formData.available_until || ""}
                            onChange={(e) => updateField("available_until", e.target.value)}
                            className={INPUT}
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  {/* Daily limit */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={hasDailyLimit}
                        onChange={(e) => setHasDailyLimit(e.target.checked)}
                        className="accent-[#f5c518]"
                      />
                      <span className="text-xs font-bold text-white/60">Set daily quantity limit?</span>
                    </label>
                    {hasDailyLimit && (
                      <div className="space-y-2">
                        <Field label="Max per day">
                          <input
                            type="number"
                            min="1"
                            value={formData.daily_limit ?? ""}
                            onChange={(e) => updateField("daily_limit", parseInt(e.target.value) || null)}
                            className={INPUT}
                            placeholder="e.g. 50"
                          />
                        </Field>
                        {editingItem?.daily_limit && (
                          <p className="text-white/30 text-xs">
                            Sold today: <span className="text-[#f5c518] font-bold">
                              {editingItem.daily_sold_count ?? 0}
                            </span> / {editingItem.daily_limit}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Customer label */}
                  <div>
                    <p className="text-white/40 text-[0.6rem] uppercase tracking-[2px] font-black mb-2">Customer Badge</p>
                    <div className="flex gap-2 mb-3">
                      {(["none", "preset", "custom"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setLabelMode(mode)}
                          className={`text-[0.6rem] font-bold uppercase tracking-widest px-2.5 py-1.5 border transition-colors
                            ${labelMode === mode
                              ? "border-[#f5c518] text-[#f5c518] bg-[#f5c518]/10"
                              : "border-white/10 text-white/30 hover:text-white"
                            }`}
                        >
                          {mode === "none" ? "None" : mode === "preset" ? "Preset" : "Custom"}
                        </button>
                      ))}
                    </div>
                    {labelMode === "preset" && (
                      <div className="flex flex-wrap gap-1.5">
                        {CUSTOMER_LABEL_PRESETS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateField("customer_label", p)}
                            className={`text-[0.6rem] font-bold px-2 py-1 border transition-colors
                              ${formData.customer_label === p
                                ? "border-[#f5c518] text-[#f5c518] bg-[#f5c518]/10"
                                : "border-white/10 text-white/40 hover:text-white"
                              }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                    {labelMode === "custom" && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          maxLength={20}
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                          className={INPUT}
                          placeholder="e.g. Launch Special"
                        />
                        <p className="text-white/20 text-[0.6rem] text-right">{customLabel.length}/20</p>
                      </div>
                    )}
                    {/* Preview */}
                    {(formData.customer_label || (labelMode === "custom" && customLabel)) && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-white/30 text-[0.6rem]">Preview:</span>
                        <span className="text-[0.6rem] font-black px-2 py-0.5 border border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518]">
                          {labelMode === "custom" ? customLabel : formData.customer_label}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-white/5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#f5c518] text-black py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              {editingItem ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
