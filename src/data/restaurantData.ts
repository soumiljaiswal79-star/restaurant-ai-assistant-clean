export interface MenuItem {
  name: string;
  price: string;
  tags?: string[];
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    category: "Starters - Vegetarian",
    items: [
      { name: "Paneer Tikka", price: "₹350", tags: ["bestseller"] },
      { name: "Hara Bhara Kebab", price: "₹280", tags: ["vegan"] },
      { name: "Mushroom Galouti", price: "₹320" },
      { name: "Corn & Cheese Balls", price: "₹260" },
    ],
  },
  {
    category: "Starters - Non-Vegetarian",
    items: [
      { name: "Chicken Tikka", price: "₹420", tags: ["bestseller"] },
      { name: "Mutton Seekh Kebab", price: "₹480" },
      { name: "Tandoori Prawns", price: "₹550" },
      { name: "Fish Amritsari", price: "₹450" },
    ],
  },
  {
    category: "Main Course",
    items: [
      { name: "Dal Makhani", price: "₹380", tags: ["bestseller", "vegetarian"] },
      { name: "Butter Chicken", price: "₹450", tags: ["bestseller"] },
      { name: "Lamb Rogan Josh", price: "₹520" },
      { name: "Paneer Butter Masala", price: "₹400", tags: ["vegetarian"] },
      { name: "Grilled Salmon", price: "₹680", tags: ["gluten-free"] },
      { name: "Vegetable Biryani", price: "₹350", tags: ["vegetarian"] },
      { name: "Chicken Biryani", price: "₹420", tags: ["bestseller"] },
    ],
  },
  {
    category: "Desserts",
    items: [
      { name: "Gulab Jamun", price: "₹220", tags: ["vegetarian"] },
      { name: "Rasmalai", price: "₹250", tags: ["bestseller"] },
      { name: "Chocolate Fondant", price: "₹320" },
      { name: "Mango Sorbet", price: "₹200", tags: ["vegan", "gluten-free"] },
    ],
  },
  {
    category: "Beverages",
    items: [
      { name: "Mango Lassi", price: "₹180" },
      { name: "Masala Chai", price: "₹120" },
      { name: "Fresh Lime Soda", price: "₹150" },
      { name: "House Red Wine (glass)", price: "₹450" },
      { name: "Craft Beer", price: "₹380" },
    ],
  },
];

export type SlotStatus = "available" | "limited" | "full";

export interface TimeSlot {
  time: string;
  status: SlotStatus;
  tables: { size: number; available: number }[];
}

export interface DaySchedule {
  day: string;
  lunch: TimeSlot[];
  dinner: TimeSlot[];
}

export const availabilitySchedule: DaySchedule[] = [
  {
    day: "Monday",
    lunch: [
      { time: "12:00 PM", status: "available", tables: [{ size: 2, available: 4 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
      { time: "1:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
      { time: "2:00 PM", status: "available", tables: [{ size: 2, available: 5 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "8:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
    ],
  },
  {
    day: "Tuesday",
    lunch: [
      { time: "12:00 PM", status: "available", tables: [{ size: 2, available: 4 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
      { time: "1:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "2:00 PM", status: "available", tables: [{ size: 2, available: 4 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "limited", tables: [{ size: 2, available: 2 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "8:00 PM", status: "full", tables: [{ size: 2, available: 0 }, { size: 4, available: 0 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 1 }, { size: 8, available: 0 }] },
    ],
  },
  {
    day: "Wednesday",
    lunch: [
      { time: "12:00 PM", status: "available", tables: [{ size: 2, available: 5 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
      { time: "1:00 PM", status: "available", tables: [{ size: 2, available: 4 }, { size: 4, available: 3 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "2:00 PM", status: "available", tables: [{ size: 2, available: 5 }, { size: 4, available: 4 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "8:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 0 }, { size: 6, available: 1 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "available", tables: [{ size: 2, available: 4 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
    ],
  },
  {
    day: "Thursday",
    lunch: [
      { time: "12:00 PM", status: "available", tables: [{ size: 2, available: 4 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
      { time: "1:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "2:00 PM", status: "available", tables: [{ size: 2, available: 5 }, { size: 4, available: 3 }, { size: 6, available: 2 }, { size: 8, available: 1 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "8:00 PM", status: "limited", tables: [{ size: 2, available: 2 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
    ],
  },
  {
    day: "Friday",
    lunch: [
      { time: "12:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "1:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "2:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "8:00 PM", status: "full", tables: [{ size: 2, available: 0 }, { size: 4, available: 0 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "8:30 PM", status: "full", tables: [{ size: 2, available: 0 }, { size: 4, available: 0 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "limited", tables: [{ size: 2, available: 2 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
    ],
  },
  {
    day: "Saturday",
    lunch: [
      { time: "12:00 PM", status: "limited", tables: [{ size: 2, available: 2 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "1:00 PM", status: "full", tables: [{ size: 2, available: 0 }, { size: 4, available: 0 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "2:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "8:00 PM", status: "full", tables: [{ size: 2, available: 0 }, { size: 4, available: 0 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 0 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
    ],
  },
  {
    day: "Sunday",
    lunch: [
      { time: "12:00 PM", status: "limited", tables: [{ size: 2, available: 2 }, { size: 4, available: 1 }, { size: 6, available: 1 }, { size: 8, available: 0 }] },
      { time: "1:00 PM", status: "limited", tables: [{ size: 2, available: 1 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "2:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
    ],
    dinner: [
      { time: "7:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
      { time: "8:00 PM", status: "limited", tables: [{ size: 2, available: 2 }, { size: 4, available: 1 }, { size: 6, available: 0 }, { size: 8, available: 0 }] },
      { time: "9:00 PM", status: "available", tables: [{ size: 2, available: 3 }, { size: 4, available: 2 }, { size: 6, available: 1 }, { size: 8, available: 1 }] },
    ],
  },
];

export function getMenuSummary(): string {
  return "We offer a mix of Indian and Continental cuisine, with popular vegetarian, non-vegetarian, and vegan options. Our specialties include Butter Chicken, Dal Makhani, and Paneer Tikka. Would you like recommendations or details on a specific category?";
}

export function getMenuByCategory(query: string): string {
  const q = query.toLowerCase();
  const matched = menuData.filter((c) =>
    c.category.toLowerCase().includes(q) ||
    c.items.some((i) => i.name.toLowerCase().includes(q) || i.tags?.some((t) => t.includes(q)))
  );

  if (matched.length === 0) return "I couldn't find items matching that. We have Starters, Main Course, Desserts, and Beverages. Which would you like to explore?";

  return matched
    .map((c) => `**${c.category}**\n${c.items.map((i) => `- ${i.name} — ${i.price}${i.tags?.length ? ` _(${i.tags.join(", ")})_` : ""}`).join("\n")}`)
    .join("\n\n");
}

export function checkAvailability(day: string, time: string, guests: number): { available: boolean; slot?: TimeSlot; alternatives?: string[] } {
  const schedule = availabilitySchedule.find((d) => d.day.toLowerCase() === day.toLowerCase());
  if (!schedule) return { available: false, alternatives: ["Please provide a valid day (Monday-Sunday)."] };

  const allSlots = [...schedule.lunch, ...schedule.dinner];
  const slot = allSlots.find((s) => s.time.toLowerCase() === time.toLowerCase());

  const tableSize = guests <= 2 ? 2 : guests <= 4 ? 4 : guests <= 6 ? 6 : 8;

  if (slot) {
    const table = slot.tables.find((t) => t.size >= tableSize && t.available > 0);
    if (table) return { available: true, slot };

    // Find alternatives
    const alts = allSlots
      .filter((s) => s.time !== slot.time && s.tables.some((t) => t.size >= tableSize && t.available > 0))
      .map((s) => s.time);
    return { available: false, alternatives: alts.length > 0 ? alts : ["No tables available for that day. Please try another day."] };
  }

  const alts = allSlots
    .filter((s) => s.tables.some((t) => t.size >= tableSize && t.available > 0))
    .map((s) => s.time);
  return { available: false, alternatives: alts.length > 0 ? alts : ["No tables available for that day."] };
}
