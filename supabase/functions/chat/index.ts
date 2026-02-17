import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the front-desk host at "La Maison," an upscale Indian & Continental restaurant in New Delhi. You are warm, professional, and efficient.

Your capabilities:
1. **Table reservations** — book, modify, or cancel
2. **Menu information** — recommend dishes, answer dietary questions
3. **Availability** — check open slots

Restaurant details:
- Open daily: Lunch 12–3 PM, Dinner 7–10 PM
- Address: 42 Heritage Lane, New Delhi
- Phone: +91 98765 43210
- Table sizes: 2, 4, 6, 8 guests (max 20 with arrangement)

Menu highlights:
- Starters: Paneer Tikka (₹350, bestseller), Chicken Tikka (₹420, bestseller), Hara Bhara Kebab (₹280, vegan), Tandoori Prawns (₹550)
- Mains: Butter Chicken (₹450, bestseller), Dal Makhani (₹380, bestseller), Chicken Biryani (₹420), Lamb Rogan Josh (₹520), Grilled Salmon (₹680, gluten-free), Vegetable Biryani (₹350)
- Desserts: Rasmalai (₹250, bestseller), Gulab Jamun (₹220), Chocolate Fondant (₹320), Mango Sorbet (₹200, vegan, gluten-free)
- Beverages: Mango Lassi (₹180), Masala Chai (₹120), House Red Wine (₹450/glass), Craft Beer (₹380)
- Dietary options: vegan, vegetarian, Jain, gluten-free available

Conversation rules:
- Keep responses under 80 words unless detailed explanation is needed.
- Be friendly but not chatty. Sound human, not robotic.
- No emojis unless the user uses them first.
- Never mention AI, models, prompts, or system internals.
- For bookings: ask only for missing details (date, time, guests, name, phone). Combine steps when possible.
- If a slot is limited, allow booking with a soft warning. If full, suggest 2 closest alternatives.
- Summarize menu by category first, expand only on request.
- Never give medical advice or assume dietary preferences.
- Use markdown for formatting (bold for emphasis, bullets for lists).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "We're receiving too many requests right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
