const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function parseDay(input: string): { day: string; date: string } | null {
  const lower = input.toLowerCase().trim();

  for (const d of DAYS) {
    if (lower.includes(d)) {
      return { day: d.charAt(0).toUpperCase() + d.slice(1), date: d.charAt(0).toUpperCase() + d.slice(1) };
    }
  }

  const now = new Date();
  if (lower.includes("today")) {
    const dayName = DAYS[now.getDay()];
    return { day: dayName.charAt(0).toUpperCase() + dayName.slice(1), date: "Today" };
  }
  if (lower.includes("tomorrow")) {
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const dayName = DAYS[tom.getDay()];
    return { day: dayName.charAt(0).toUpperCase() + dayName.slice(1), date: "Tomorrow" };
  }

  return null;
}

export function parseTime(input: string): string | null {
  const match = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const minutes = match[2] || "00";
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hour < 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;
  if (!meridian && hour < 6) hour += 12;

  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const m = meridian || (hour >= 12 ? "PM" : "AM");
  return `${h}:${minutes} ${typeof m === "string" && m.length === 2 ? m : hour >= 12 ? "PM" : "AM"}`;
}

export function parseGuests(input: string): number | null {
  const match = input.match(/(\d+)/);
  if (match) {
    const n = parseInt(match[1]);
    if (n >= 1 && n <= 20) return n;
  }
  return null;
}

export function parsePhone(input: string): string | null {
  const match = input.match(/[\d\s\-+()]{7,}/);
  return match ? match[0].trim() : null;
}

/** Extract multiple booking details from a single message */
export function extractBookingDetails(input: string): {
  day?: { day: string; date: string };
  time?: string;
  guests?: number;
  name?: string;
  phone?: string;
} {
  const result: ReturnType<typeof extractBookingDetails> = {};

  result.day = parseDay(input);
  result.time = parseTime(input);
  result.guests = parseGuests(input) ?? undefined;

  // Try to extract a name — look for "for [Name]" or "name is [Name]" patterns
  const nameMatch = input.match(/(?:for|name\s+is|name:?\s*|i'?m\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) result.name = nameMatch[1].trim();

  result.phone = parsePhone(input) ?? undefined;

  return result;
}
