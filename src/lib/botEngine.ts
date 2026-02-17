import { getMenuSummary, getMenuByCategory, checkAvailability } from "@/data/restaurantData";
import { extractBookingDetails, parseDay, parseTime, parseGuests, parsePhone } from "./bot/parsers";
import { detectIntent, detectMenuCategory, isAffirmative, isNegative } from "./bot/intents";
import type { BotContext, ReservationDetails } from "./bot/types";

export type { Message, ReservationDetails } from "./bot/types";

export function createBotEngine() {
  let ctx: BotContext = {
    state: "idle",
    reservation: {},
  };

  function getGreeting(): string {
    return "Welcome to La Maison! I can help you book a table, browse the menu, or check availability. What can I do for you?";
  }

  /** Figure out what's still missing from the reservation */
  function getMissing(r: ReservationDetails): (keyof ReservationDetails)[] {
    const required: (keyof ReservationDetails)[] = ["day", "time", "guests", "name", "phone"];
    return required.filter((k) => !r[k]);
  }

  /** Build a natural prompt asking for the next missing piece(s) */
  function askNext(r: ReservationDetails): string {
    const missing = getMissing(r);
    if (missing.length === 0) return ""; // shouldn't happen

    // Ask for up to 2 things at once to feel natural but not overwhelming
    const asks: string[] = [];
    for (const field of missing) {
      switch (field) {
        case "day": asks.push("which day"); break;
        case "time": asks.push("what time (lunch 12–2 PM / dinner 7–9 PM)"); break;
        case "guests": asks.push("how many guests"); break;
        case "name": asks.push("a name for the reservation"); break;
        case "phone": asks.push("a contact number"); break;
      }
      if (asks.length >= 2) break;
    }

    // Contextual lead-in
    const collected = Object.entries(r).filter(([, v]) => v).length;
    if (collected === 0) return `Great, I'll set that up. Could you let me know ${asks.join(" and ")}?`;
    return `Got it. I just need ${asks.join(" and ")}.`;
  }

  /** Try to absorb any booking info from the user's message into the reservation */
  function absorb(input: string): void {
    const details = extractBookingDetails(input);
    if (details.day && !ctx.reservation.day) {
      ctx.reservation.day = details.day.day;
      ctx.reservation.date = details.day.date;
    }
    if (details.time && !ctx.reservation.time) ctx.reservation.time = details.time;
    if (details.guests && !ctx.reservation.guests) ctx.reservation.guests = details.guests;
    if (details.name && !ctx.reservation.name) ctx.reservation.name = details.name;
    if (details.phone && !ctx.reservation.phone) ctx.reservation.phone = details.phone;
  }

  /** Absorb then handle single-field fallback for collecting state */
  function absorbFallback(input: string): void {
    absorb(input);
    const r = ctx.reservation;
    const missing = getMissing(r);
    if (missing.length === 0) return;

    // If nothing was absorbed, try to interpret raw input as the first missing field
    const firstMissing = missing[0];
    const alreadyAbsorbed = Object.entries(extractBookingDetails(input)).some(([, v]) => v);
    if (alreadyAbsorbed) return;

    switch (firstMissing) {
      case "day": { const d = parseDay(input); if (d) { r.day = d.day; r.date = d.date; } break; }
      case "time": { const t = parseTime(input); if (t) r.time = t; break; }
      case "guests": { const g = parseGuests(input); if (g) r.guests = g; break; }
      case "name": if (input.length >= 2 && !input.match(/^\d+$/)) r.name = input.trim(); break;
      case "phone": { const p = parsePhone(input); if (p) r.phone = p; break; }
    }
  }

  /** Check availability and return a response or null if all good */
  function checkAndRespond(r: ReservationDetails): string | null {
    if (!r.day || !r.time || !r.guests) return null;

    const result = checkAvailability(r.day, r.time, r.guests);
    if (result.available) {
      if (result.slot?.status === "limited") {
        return `${r.time} on ${r.date} is filling up, but I can still get you in. `;
      }
      return null; // all good, continue collecting
    }

    // Full — suggest alternatives
    const alts = result.alternatives;
    if (alts && alts.length > 0 && !alts[0].includes("another day") && !alts[0].includes("valid day")) {
      r.time = undefined; // clear so they pick again
      const suggestions = alts.slice(0, 2).join(" or ");
      return `${ctx.reservation.date} at ${result.slot ? r.time : "that time"} is fully booked for ${r.guests}. How about ${suggestions}?`;
    }

    r.day = undefined;
    r.date = undefined;
    r.time = undefined;
    return `We're pretty packed on ${r.date || "that day"} for ${r.guests} guests. Want to try a different day?`;
  }

  function buildConfirmation(r: ReservationDetails): string {
    return `Here's what I have:\n- **${r.date}** (${r.day}) at **${r.time}**\n- **${r.guests} guest${r.guests! > 1 ? "s" : ""}**\n- Under **${r.name}** — ${r.phone}\n\nShall I lock this in?`;
  }

  function processMessage(userInput: string): string {
    const input = userInput.trim();

    // === CONFIRMATION STATE ===
    if (ctx.state === "confirm") {
      if (isAffirmative(input)) {
        ctx.confirmedReservation = { ...ctx.reservation };
        const r = ctx.confirmedReservation;
        ctx.state = "idle";
        ctx.reservation = {};
        return `You're all set! Table for ${r.guests} on ${r.date} at ${r.time}, under ${r.name}. We look forward to seeing you at La Maison!`;
      }
      if (isNegative(input)) {
        ctx.state = "idle";
        ctx.reservation = {};
        return "No worries, I've scrapped that. Let me know if you'd like to start fresh.";
      }
      return "Just need a yes or no on that booking — shall I confirm it?";
    }

    // === CANCEL CONFIRMATION STATE ===
    if (ctx.state === "cancel_confirm") {
      if (isAffirmative(input)) {
        ctx.confirmedReservation = undefined;
        ctx.state = "idle";
        return "Done, your reservation is cancelled. If you'd like to rebook anytime, just say the word.";
      }
      ctx.state = "idle";
      return "Alright, keeping your reservation as is. Anything else?";
    }

    // === COLLECTING STATE — absorb info and move forward ===
    if (ctx.state === "collecting") {
      // Check if user wants to bail
      if (isNegative(input) && getMissing(ctx.reservation).length > 2) {
        ctx.state = "idle";
        ctx.reservation = {};
        return "No problem, we can pick this up anytime. What else can I help with?";
      }

      absorbFallback(input);

      // Check availability once we have day + time + guests
      const availMsg = checkAndRespond(ctx.reservation);
      if (availMsg && !ctx.reservation.time) {
        return availMsg; // slot issue, asked for new time/day
      }

      const missing = getMissing(ctx.reservation);
      if (missing.length === 0) {
        ctx.state = "confirm";
        const prefix = availMsg || "";
        return prefix + buildConfirmation(ctx.reservation);
      }

      return (availMsg || "") + askNext(ctx.reservation);
    }

    // === IDLE STATE — detect intent ===
    const intent = detectIntent(input);

    switch (intent) {
      case "reserve": {
        ctx.state = "collecting";
        ctx.reservation = {};
        absorb(input); // grab anything they already mentioned

        const missing = getMissing(ctx.reservation);
        if (missing.length === 0) {
          const availMsg = checkAndRespond(ctx.reservation);
          if (availMsg && !ctx.reservation.time) return availMsg;
          ctx.state = "confirm";
          return (availMsg || "") + buildConfirmation(ctx.reservation);
        }

        // Check availability early if we have enough
        const availMsg = checkAndRespond(ctx.reservation);
        if (availMsg && !ctx.reservation.time) return availMsg;

        return (availMsg || "") + askNext(ctx.reservation);
      }

      case "menu": {
        const cat = detectMenuCategory(input);
        return cat ? getMenuByCategory(cat) : getMenuSummary();
      }

      case "cancel":
        if (ctx.confirmedReservation) {
          ctx.state = "cancel_confirm";
          const r = ctx.confirmedReservation;
          return `I have your booking under **${r.name}** for ${r.guests} on ${r.date} at ${r.time}. Want me to cancel it?`;
        }
        return "I don't have an active reservation on file. Would you like to make one?";

      case "modify":
        if (ctx.confirmedReservation) {
          ctx.state = "collecting";
          ctx.reservation = { ...ctx.confirmedReservation };
          return "Sure, let's update your booking. What would you like to change — day, time, or guest count?";
        }
        return "No active reservation to modify. Want to book a new one?";

      case "hours":
        return "We're open daily — **lunch 12–3 PM** and **dinner 7–10 PM**. Want me to check a specific slot?";

      case "greeting":
        return "Hey there! I can help you book a table, check the menu, or look up availability. What sounds good?";

      case "thanks":
        return "Happy to help! Enjoy your visit to La Maison.";

      case "bye":
        return "See you soon! Looking forward to having you at La Maison.";

      default:
        return "I can help with **reservations**, **menu info**, or **availability**. What would you like?";
    }
  }

  return { getGreeting, processMessage };
}
