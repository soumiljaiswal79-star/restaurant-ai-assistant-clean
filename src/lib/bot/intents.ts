export type Intent = "reserve" | "menu" | "cancel" | "modify" | "hours" | "greeting" | "thanks" | "bye" | "unknown";

export function detectIntent(input: string): Intent {
  const lower = input.toLowerCase();
  if (lower.match(/\b(reserve|book|table|reservation|booking|seat)\b/)) return "reserve";
  if (lower.match(/\b(menu|dish|food|eat|starter|dessert|drink|beverage|veg|non.?veg|vegan|biryani|chicken|paneer)\b/)) return "menu";
  if (lower.match(/\b(cancel|remove|delete)\b/)) return "cancel";
  if (lower.match(/\b(change|modify|update|reschedule)\b/)) return "modify";
  if (lower.match(/\b(hour|open|close|timing|schedule|available|availability)\b/)) return "hours";
  if (lower.match(/\b(hi|hello|hey|good morning|good evening|good afternoon)\b/)) return "greeting";
  if (lower.match(/\b(thank|thanks|thx)\b/)) return "thanks";
  if (lower.match(/\b(bye|goodbye|see you)\b/)) return "bye";
  return "unknown";
}

export function detectMenuCategory(input: string): string | null {
  const lower = input.toLowerCase();
  if (lower.match(/\b(starter|appetizer)\b/)) return "starter";
  if (lower.match(/\b(main|course|entree)\b/)) return "main";
  if (lower.match(/\b(dessert|sweet)\b/)) return "dessert";
  if (lower.match(/\b(drink|beverage|wine|beer)\b/)) return "beverage";
  if (lower.match(/\b(veg|vegetarian)\b/) && !lower.includes("non")) return "vegetarian";
  if (lower.match(/\b(non.?veg|chicken|mutton|fish|prawn|lamb)\b/)) return "non-veg";
  if (lower.match(/\b(vegan)\b/)) return "vegan";
  if (lower.match(/\b(gluten)\b/)) return "gluten-free";
  return null;
}

export function isAffirmative(input: string): boolean {
  return !!input.toLowerCase().match(/\b(yes|yeah|yep|sure|confirm|proceed|ok|okay|go ahead|lock|do it|absolutely|please)\b/);
}

export function isNegative(input: string): boolean {
  return !!input.toLowerCase().match(/\b(no|nope|cancel|nah|don't|never mind|forget)\b/);
}
