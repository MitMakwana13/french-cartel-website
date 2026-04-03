import type { MenuItem } from "./supabase/types";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function getNowIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

function getCurrentDayIST(): number {
  return getNowIST().getUTCDay(); // 0=Sun … 6=Sat
}

function getCurrentTimeISTMinutes(): number {
  const d = getNowIST();
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatAvailableDays(days: number[]): string {
  if (!days || days.length === 0) return "Never";
  if (days.length === 7) return "Everyday";
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
  if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
  if (days.length === 3 && days.includes(5) && days.includes(6) && days.includes(0)) return "Fri–Sun";
  const sorted = [...days].sort();
  return sorted.map((d) => DAY_NAMES[d]).join(", ");
}

function formatTimeMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}${m > 0 ? `:${String(m).padStart(2, "0")}` : ""} ${ampm}`;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;           // shown to customers
  label?: string;            // badge text
  labelColor?: string;       // badge CSS color class
  daysRemaining?: number;    // for day-restricted items
  limitProgress?: number;    // 0-1 for daily limit bar
  almostGone?: boolean;      // true if > 80% of daily limit sold
}

const LABEL_COLORS: Record<string, string> = {
  "New!": "text-green-400 bg-green-400/10 border-green-400/30",
  "Popular": "text-[#f5c518] bg-[#f5c518]/10 border-[#f5c518]/30",
  "Weekend Special": "text-purple-400 bg-purple-400/10 border-purple-400/30",
  "Weekend Only": "text-purple-400 bg-purple-400/10 border-purple-400/30",
  "Limited Edition": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "Chef's Pick": "text-[#f5c518] bg-[#f5c518]/10 border-[#f5c518]/30",
  "Seasonal": "text-teal-400 bg-teal-400/10 border-teal-400/30",
  "Back by Demand": "text-pink-400 bg-pink-400/10 border-pink-400/30",
};

export function getLabelColor(label: string): string {
  return LABEL_COLORS[label] || "text-white/60 bg-white/5 border-white/10";
}

/** Server + client safe availability check (IST-aware) */
export function isItemAvailable(item: MenuItem): AvailabilityResult {
  // Check 1: Manual out_of_stock
  if (item.stock_status === "out_of_stock") {
    return { available: false, reason: "Sold out" };
  }

  // Check 2: Daily limit
  if (item.daily_limit != null && item.daily_sold_count != null) {
    const progress = item.daily_sold_count / item.daily_limit;
    if (item.daily_sold_count >= item.daily_limit) {
      return {
        available: false,
        reason: "Daily limit reached — sold out for today",
        limitProgress: 1,
        almostGone: true,
      };
    }
    const almostGone = progress >= 0.8;
    const remaining = item.daily_limit - item.daily_sold_count;
    const label =
      item.customer_label ||
      (item.stock_status === "low_stock" ? "⚡ Almost Gone" : almostGone ? `🔥 Only ${remaining} left!` : undefined);
    const labelColor = getLabelColor(item.customer_label || "");
    return {
      available: true,
      label,
      labelColor,
      limitProgress: progress,
      almostGone,
    };
  }

  // Check 3: Day-of-week restriction (skip on server — no IST context, handled client-side)
  if (typeof window !== "undefined" && item.available_days && item.available_days.length < 7) {
    const today = getCurrentDayIST();
    if (!item.available_days.includes(today)) {
      return {
        available: false,
        reason: `Available ${formatAvailableDays(item.available_days)} only`,
        label: `Available ${formatAvailableDays(item.available_days)}`,
        labelColor: "text-purple-400 bg-purple-400/10 border-purple-400/30",
      };
    }
  }

  // Check 4: Time restriction
  if (typeof window !== "undefined" && item.available_from && item.available_until) {
    const nowMinutes = getCurrentTimeISTMinutes();
    const fromMinutes = timeStringToMinutes(item.available_from);
    const untilMinutes = timeStringToMinutes(item.available_until);
    if (nowMinutes < fromMinutes || nowMinutes > untilMinutes) {
      return {
        available: false,
        reason: `Available ${formatTimeMinutes(fromMinutes)}–${formatTimeMinutes(untilMinutes)} IST`,
      };
    }
  }

  // All checks passed
  const label = item.customer_label || (item.stock_status === "low_stock" ? "⚡ Almost Gone" : undefined);
  const labelColor = item.customer_label ? getLabelColor(item.customer_label) : "text-amber-400 bg-amber-400/10 border-amber-400/30";

  return { available: true, label, labelColor };
}

/** Server-side day check using UTC offset */
export function isItemAvailableServerSide(item: MenuItem): AvailabilityResult {
  if (item.stock_status === "out_of_stock") return { available: false, reason: "Sold out" };

  if (item.daily_limit != null && item.daily_sold_count != null && item.daily_sold_count >= item.daily_limit) {
    return { available: false, reason: "Daily limit reached", limitProgress: 1 };
  }

  if (item.available_days && item.available_days.length < 7) {
    const today = getCurrentDayIST();
    if (!item.available_days.includes(today)) {
      return {
        available: false,
        reason: `Available ${formatAvailableDays(item.available_days)} only`,
        label: `Available ${formatAvailableDays(item.available_days)}`,
      };
    }
  }

  if (item.available_from && item.available_until) {
    const nowMinutes = getCurrentTimeISTMinutes();
    const fromMinutes = timeStringToMinutes(item.available_from);
    const untilMinutes = timeStringToMinutes(item.available_until);
    if (nowMinutes < fromMinutes || nowMinutes > untilMinutes) {
      return {
        available: false,
        reason: `Available ${formatTimeMinutes(fromMinutes)}–${formatTimeMinutes(untilMinutes)} IST`,
      };
    }
  }

  const label = item.customer_label || (item.stock_status === "low_stock" ? "⚡ Almost Gone" : undefined);
  const limitProgress =
    item.daily_limit && item.daily_sold_count != null
      ? item.daily_sold_count / item.daily_limit
      : undefined;
  const almostGone = limitProgress != null && limitProgress >= 0.8;

  return { available: true, label, limitProgress, almostGone };
}
