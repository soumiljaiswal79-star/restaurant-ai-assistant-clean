# 🤖 AI Design — La Maison Restaurant Assistant

## Where Is the AI?

The AI lives in a single **backend edge function** (`supabase/functions/chat/index.ts`). No AI logic runs in the browser — the frontend only sends messages and renders streamed responses.

```
Browser (React)  ──POST──►  Edge Function (Deno)  ──POST──►   AI Gateway
                 ◄──SSE───                        ◄──SSE───   (Gemini 3 Flash)
```

### Touchpoints

| Layer          | File                              | AI Role                                    |
|----------------|-----------------------------------|--------------------------------------------|
| Edge Function  | `supabase/functions/chat/index.ts`| Holds system prompt, proxies to AI gateway |
| SSE Client     | `src/lib/chatApi.ts`              | Parses streamed tokens from the gateway    |
| Chat UI        | `src/components/ChatWindow.tsx`   | Sends history, renders progressive output  |
| Message Bubble | `src/components/ChatMessage.tsx`  | Renders markdown-formatted AI responses    |

---

## Why Is AI Needed?

### The Problem

A traditional reservation system requires rigid forms — date pickers, dropdowns, multi-step wizards. Users must adapt to the system's structure.

### The AI Solution

Natural language replaces structured forms. A single chat input handles:

| Capability              | Without AI                          | With AI                                        |
|-------------------------|-------------------------------------|------------------------------------------------|
| **Booking a table**     | 4-step form (date, time, guests, contact) | "Table for 4 on Friday at 8 PM"          |
| **Menu exploration**    | Static page with filters            | "Any vegan mains under ₹400?"                 |
| **Modifying a booking** | Find booking → edit form            | "Can I change to Saturday instead?"            |
| **Availability check**  | Calendar widget                     | "Is there anything open Friday evening?"       |
| **Recommendations**     | Not possible                        | "What's good for a first-time visit?"          |

### Why Not a Rule-Based Bot?

The project originally used a local rule-based engine (`botEngine.ts`) with regex intent detection. It was replaced because:

1. **Brittle parsing** — "Book me a table for four this Friday around 8-ish" would fail on "four" (not "4") and "8-ish" (not "8 PM")
2. **No context memory** — Each message was processed independently; the bot couldn't handle follow-ups like "Actually, make it 6 people"
3. **Rigid responses** — Canned templates felt robotic; no ability to rephrase or elaborate naturally
4. **Limited scope** — Adding new capabilities (dietary advice, chef recommendations) required writing new regex patterns and response templates

The AI model handles all of this out of the box with a single system prompt.

---

## How Does It Work?

### 1. System Prompt (Persona Engineering)

The edge function prepends a **system prompt** that defines:

- **Identity**: Front-desk host at "La Maison," warm and professional
- **Knowledge**: Full menu with prices, dietary tags, and bestsellers
- **Capabilities**: Booking, modification, cancellation, menu queries, availability checks
- **Constraints**: <80 words, no emojis (unless user starts), no AI/model mentions
- **Booking logic**: Ask only for missing details, combine steps, suggest alternatives for full slots

```typescript
// Simplified system prompt structure
{
  role: "system",
  content: `You are the front-desk host at "La Maison"...
    Menu highlights: Paneer Tikka (₹350, bestseller)...
    Rules: Keep responses under 80 words...`
}
```

The system prompt is **server-side only** — it never reaches the browser, preventing prompt injection from the client.

### 2. Conversation History (Context Window)

Every request includes the **full conversation history**, enabling multi-turn context:

```
User: "Book a table for Friday"
Bot:  "For how many guests, and what time works best?"
User: "4 people, 8 PM"          ← The AI knows this refers to the Friday booking
Bot:  "Friday at 8 PM for 4 — I'll need a name and phone number to confirm."
```

The history is built client-side in `ChatWindow.tsx`:

```typescript
const history = messages.map(m => ({
  role: m.role === "bot" ? "assistant" : "user",
  content: m.content,
}));
```

### 3. Streaming (SSE)

Responses stream **token-by-token** rather than waiting for the full response:

```
Gateway sends:  data: {"choices":[{"delta":{"content":"Welcome"}}]}
                data: {"choices":[{"delta":{"content":" to"}}]}
                data: {"choices":[{"delta":{"content":" La Maison"}}]}
                data: [DONE]
```

**Why streaming matters:**
- **Perceived speed** — First token appears in ~200ms vs ~2s for full response
- **Natural feel** — Text appears progressively, mimicking human typing
- **Early feedback** — Users see the bot is responding immediately

### 4. Model Selection

| Model                          | Why Chosen                                              |
|--------------------------------|---------------------------------------------------------|
| `google/gemini-3-flash-preview`| Fast inference (~200ms first token), good conversational quality, cost-effective for high-volume chat |

The model is specified in the edge function's request body:

```typescript
body: JSON.stringify({
  model: "google/gemini-3-flash-preview",
  messages: [systemPrompt, ...history],
  stream: true,
})
```

### 5. Error Handling

| Scenario            | HTTP Status | AI Gateway Cause              | User Experience                    |
|---------------------|-------------|-------------------------------|------------------------------------|
| Too many requests   | 429         | Workspace rate limit exceeded | Toast: "Too many requests"         |
| No credits          | 402         | Workspace credits exhausted   | Toast: "AI credits exhausted"      |
| Gateway failure     | 500         | Model error or timeout        | Toast: "Something went wrong"      |
| Missing API key     | 500         | `API_KEY` not set             | Server log, generic error to user  |
| Malformed SSE chunk | —           | Partial JSON in stream        | Buffered and retried on next chunk |

---

## Security Considerations

| Concern                | Mitigation                                                    |
|------------------------|---------------------------------------------------------------|
| Prompt injection       | System prompt is server-side only; user input is message-only |
| API key exposure       | `API_KEY` is a server-side secret, never sent to browser |
| Response manipulation  | System prompt enforces persona constraints and topic boundaries |
| Abuse / spam           | Rate limiting (429) at the gateway level                      |
| Cost control           | Credit-based billing with 402 enforcement                     |

---

## Data Flow Summary

```
1. User types "Table for 4 on Friday at 8 PM"
2. ChatWindow appends to messages[] state
3. chatApi.streamChat() sends POST with full history:
   {
     messages: [
       { role: "assistant", content: "Welcome to La Maison..." },
       { role: "user", content: "Table for 4 on Friday at 8 PM" }
     ]
   }
4. Edge function prepends system prompt → forwards to AI gateway
5. Gateway returns SSE stream
6. Edge function pipes stream directly to client (no buffering)
7. chatApi parses each "data: {json}" line
8. onDelta() appends each token to the bot message in state
9. UI re-renders progressively via React state updates
10. "[DONE]" signals end of stream → isStreaming = false
```
