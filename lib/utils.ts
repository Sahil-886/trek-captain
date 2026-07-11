// Trek Captain — Utility Functions

/**
 * Format a number as INR currency with Indian numbering system
 * e.g. 124500 → "₹1,24,500"
 */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * Format an ISO date string as "14 Aug 2026"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate WhatsApp link with pre-filled message
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a tel: link
 */
export function getTelLink(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `tel:+91${cleanPhone}`;
}

/**
 * Export data as CSV and trigger download
 */
export function exportCSV(
  headers: string[],
  rows: string[][],
  filename: string
): void {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Format itinerary items as a WhatsApp-shareable text block
 */
export function formatItineraryAsText(
  trekTitle: string,
  items: { dayNumber: number; time: string; title: string; description: string; type: string }[]
): string {
  const days = new Map<number, typeof items>();
  items.forEach((item) => {
    const dayItems = days.get(item.dayNumber) || [];
    dayItems.push(item);
    days.set(item.dayNumber, dayItems);
  });

  let text = `🏔 *${trekTitle} — Itinerary*\n\n`;

  const sortedDays = Array.from(days.entries()).sort(([a], [b]) => a - b);
  for (const [dayNum, dayItems] of sortedDays) {
    text += `📅 *Day ${dayNum}*\n`;
    const sorted = dayItems.sort((a, b) => a.time.localeCompare(b.time));
    for (const item of sorted) {
      const typeEmoji: Record<string, string> = {
        Travel: "🚗",
        Trek: "🥾",
        Meal: "🍽",
        Rest: "😴",
        Activity: "🎯",
      };
      text += `${typeEmoji[item.type] || "•"} ${item.time} — ${item.title}\n`;
      if (item.description) {
        text += `   ${item.description}\n`;
      }
    }
    text += "\n";
  }

  return text.trim();
}

/**
 * Compute payment status for a participant based on payments vs trek price
 */
export function computePaymentStatus(
  totalPaid: number,
  pricePerPerson: number
): "Paid" | "Partial" | "Pending" {
  if (totalPaid >= pricePerPerson) return "Paid";
  if (totalPaid > 0) return "Partial";
  return "Pending";
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
