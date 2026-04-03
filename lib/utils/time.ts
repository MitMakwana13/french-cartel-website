/**
 * Converts a 24-hour SQL time string like "16:00:00" to "4:00 PM"
 */
export function formatTime24to12(time24: string | undefined | null): string {
  if (!time24) return "--:--";
  const [hours, minutes] = time24.split(":");
  if (!hours || !minutes) return time24;
  
  let h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? "PM" : "AM";
  
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  
  return `${h}:${m} ${ampm}`;
}

/**
 * Converts a 12-hour UI string like "4:00 PM" to "16:00:00" for SQL
 */
export function formatTime12to24(time12: string): string {
  const [time, modifier] = time12.split(" ");
  if (!time || !modifier) return "00:00:00";
  
  let [hours, minutes] = time.split(":");
  let h = parseInt(hours, 10);
  
  if (h === 12) {
    h = modifier === "PM" ? 12 : 0;
  } else {
    h = modifier === "PM" ? h + 12 : h;
  }
  
  const hStr = h.toString().padStart(2, "0");
  return `${hStr}:${minutes}:00`;
}

/**
 * Check if the current IST time is between `open_time` and `close_time` (e.g., "16:00:00", "23:00:00").
 * Relies strictly on Asia/Kolkata timezone mapping.
 */
export function isCurrentISTWithinHours(openTimeStr: string, closeTimeStr: string): boolean {
  // 1. Get current time in IST
  const now = new Date();
  
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });
  
  const formattedParts = istFormatter.formatToParts(now);
  const hStr = formattedParts.find(p => p.type === 'hour')?.value || '00';
  const mStr = formattedParts.find(p => p.type === 'minute')?.value || '00';
  const sStr = formattedParts.find(p => p.type === 'second')?.value || '00';
  
  // Construct numerical comparable
  const currentTotalSeconds = parseInt(hStr) * 3600 + parseInt(mStr) * 60 + parseInt(sStr);
  
  // 2. Parse database times
  const parseSeconds = (t: string) => {
    const [h, m, s] = t.split(':').map(val => parseInt(val, 10) || 0);
    return (h * 3600) + (m * 60) + s;
  };

  const openSecs = parseSeconds(openTimeStr);
  let closeSecs = parseSeconds(closeTimeStr);

  // Handle past-midnight closing times (e.g. 01:00 AM)
  // If close logic is smaller than open logic, we assume it spans midnight.
  if (closeSecs < openSecs) {
     // If we are before the close time, we add 24hrs essentially to shift frame
     if (currentTotalSeconds <= closeSecs) {
       return true; // We are in the post-midnight wrap-around chunk
     }
     
     // Otherwise, we strictly verify if we've passed openSecs. 
     // closeSecs conceptually occurs at +86400 (tomorrow)
     closeSecs += 86400; 
  }

  return currentTotalSeconds >= openSecs && currentTotalSeconds <= closeSecs;
}

/**
 * Get current day index (0 = Sunday, 1 = Monday) aligned to IST
 */
export function getCurrentISTDayIndex(): number {
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata', weekday: 'short' } as const;
  const dayStr = new Intl.DateTimeFormat('en-US', options).format(now);
  
  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };
  
  return dayMap[dayStr] ?? 0;
}
