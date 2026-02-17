# 🍽️ La Maison — Detailed Project Documentation

## 1. Project Overview

**La Maison** is an AI-powered restaurant concierge chatbot built as a single-page React application. It simulates a professional front-desk host for an upscale Indian & Continental restaurant in New Delhi, helping guests:

- Book, modify, or cancel table reservations
- Browse the full menu with dietary filters
- Check real-time table availability
- Get chef recommendations and restaurant information

The chatbot uses **Google Gemini 3 Flash** , with responses streamed token-by-token using Server-Sent Events (SSE) for a fluid conversational experience.

---

## 2. Architecture

### System Diagram

```
┌─────────────────┐     POST /functions/v1/chat     ┌──────────────────────┐     POST /v1/chat/completions     ┌─────────────────────┐
│   React SPA     │ ──────────────────────────────► │  Supabase Edge       │ ──────────────────────────────► │   AI Gateway │
│   (Browser)     │ ◄─────────────────────────────  │  Function (Deno)     │ ◄──────────────────────────────  │  Gemini 3 Flash     │
│                 │     SSE token stream             │                      │     SSE response stream          │                     │
└─────────────────┘                                  └──────────────────────┘                                  └─────────────────────┘
```

### Request Lifecycle

1. **User types a message** → `ChatWindow.sendMessage()` appends to local state
2. **History is built** → All prior messages are converted to `{ role: "user" | "assistant", content }` format
3. **`streamChat()`** sends a POST request with the full conversation history to the edge function
4. **Edge function** prepends a system prompt (restaurant persona, menu data, conversation rules) and forwards to the AI gateway
5. **SSE stream** is piped back to the client; each `data: {json}` chunk is parsed for `choices[0].delta.content`
6. **UI updates progressively** — each token is appended to the bot's message bubble in real-time
7. **`[DONE]`** signal marks the end of the stream

---

## 3. Tech Stack

| Layer            | Technology                                        | Purpose                                |
|------------------|--------------------------------------------------|----------------------------------------|
| **UI Framework** | React 18 + TypeScript                             | Component-based SPA                    |
| **Build Tool**   | Vite                                              | Fast HMR, ES module bundling           |
| **Styling**      | Tailwind CSS + custom design tokens               | Utility-first CSS with theming         |
| **UI Components**| shadcn/ui (Radix primitives)                      | Accessible, composable UI primitives   |
| **Animations**   | Framer Motion                                     | Message entry animations, hero panel   |
| **Markdown**     | react-markdown                                    | Rendering bot responses with formatting|
| **Icons**        | Lucide React                                      | Consistent icon system                 |
| **Backend**      |  Cloud (Supabase Edge Functions, Deno)            | Serverless AI proxy                    |
| **AI Model**     | Google Gemini 3 Flash                             | Conversational intelligence            |
| **Streaming**    | Server-Sent Events (SSE)                          | Token-by-token response delivery       |
| **Routing**      | React Router DOM v6                               | SPA navigation                         |
| **Toasts**       | Sonner                                            | Error/notification display             |

---

## 4. Directory Structure

```
├── src/
│   ├── assets/
│   │   └── restaurant-hero.jpg          # Hero panel background image
│   │
│   ├── components/
│   │   ├── ChatWindow.tsx               # Main chat interface (state, input, quick actions)
│   │   ├── ChatMessage.tsx              # Individual message bubble with markdown
│   │   ├── NavLink.tsx                  # Navigation helper component
│   │   └── ui/                          # 40+ shadcn/ui primitives (button, card, dialog, etc.)
│   │
│   ├── data/
│   │   └── restaurantData.ts            # Menu items, availability schedule, helper functions
│   │
│   ├── lib/
│   │   ├── chatApi.ts                   # SSE streaming client (fetch → ReadableStream → parse)
│   │   ├── botEngine.ts                 # Legacy local bot engine (rule-based, not active)
│   │   ├── utils.ts                     # Tailwind merge utility
│   │   └── bot/
│   │       ├── intents.ts               # Intent detection (reserve, menu, cancel, modify, etc.)
│   │       ├── parsers.ts               # NLP parsers (day, time, guest count, phone, name)
│   │       └── types.ts                 # Shared types (Message, ReservationDetails, BotContext)
│   │
│   ├── pages/
│   │   ├── Index.tsx                    # Landing page — split hero panel + chat panel
│   │   └── NotFound.tsx                 # 404 error page
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx               # Mobile viewport detection hook
│   │   └── use-toast.ts                 # Toast notification hook
│   │
│   └── integrations/
│       └── supabase/
│           ├── client.ts                # Auto-generated Supabase client (DO NOT EDIT)
│           └── types.ts                 # Auto-generated database types (DO NOT EDIT)
│
├── supabase/
│   ├── config.toml                      # Supabase project configuration
│   └── functions/
│       └── chat/
│           └── index.ts                 # Edge function — AI gateway proxy with system prompt
│
├── ARCHITECTURE.md                      # System architecture documentation
├── PROJECT_DOCS.md                      # This file
└── README.md                            # Quick-start guide
```

---

## 5. Component Deep Dive

### 5.1 `Index.tsx` — Landing Page

The entry point renders a **split-panel layout**:
- **Left panel (45%, desktop only)**: Hero image with gradient overlay, restaurant name, tagline, and contact info (hours, address, phone). Animated entrance via Framer Motion.
- **Right panel (55%)**: Chat interface with a desktop status header ("Online") and mobile compact header.
- **Mobile**: Full-width chat with a compact branded header.

### 5.2 `ChatWindow.tsx` — Chat Interface

| Feature                  | Implementation                                                        |
|--------------------------|-----------------------------------------------------------------------|
| **Message state**        | `useState<Message[]>` initialized with a greeting message             |
| **Streaming state**      | `isStreaming` boolean prevents concurrent sends                       |
| **History conversion**   | `toApiMessages()` maps `bot`→`assistant`, filters greeting context    |
| **Progressive rendering**| `onDelta` callback appends each token to the last bot message         |
| **Quick actions**        | Three preset buttons: "Book a table", "View menu", "Check availability"|
| **Auto-scroll**          | `messagesEndRef` with `scrollIntoView({ behavior: "smooth" })`       |
| **Error handling**       | `onError` callback triggers a `sonner` toast notification             |
| **Keyboard support**     | Enter to send, Shift+Enter for newline                                |

### 5.3 `ChatMessage.tsx` — Message Bubble

- **Bot messages**: Rendered with `react-markdown` inside a `prose` container supporting bold, lists, inline code
- **User messages**: Plain text in a styled bubble
- **Avatars**: `UtensilsCrossed` icon (bot) / `User` icon (user) from Lucide
- **Animation**: `motion.div` with `opacity: 0 → 1` and `y: 12 → 0` on mount
- **Styling**: Custom `chat-bot` and `chat-user` color tokens for bubble backgrounds

### 5.4 `chatApi.ts` — SSE Streaming Client

```
fetch(POST) → ReadableStream → TextDecoder → line-by-line parsing → onDelta/onDone/onError
```

Key behaviors:
- Handles `\r\n` and `\n` line endings
- Skips SSE comments (lines starting with `:`) and empty lines
- Parses `data: {json}` lines, extracting `choices[0].delta.content`
- On incomplete JSON, pushes data back to buffer and waits for more chunks
- Final buffer flush catches edge cases where the stream ends without `[DONE]`
- Non-200 responses are parsed for error messages and surfaced via `onError`

---

## 6. Backend — Edge Function

### `supabase/functions/chat/index.ts`

**Purpose**: Proxies chat requests to the AI Gateway with a restaurant-specific system prompt.

**System Prompt Personality**:
- Warm, professional front-desk host persona
- Knowledge of full menu with prices and dietary tags
- Booking rules: ask only for missing details, combine steps
- Response constraints: <80 words, no emojis (unless user uses them), no AI mentions
- Availability logic: allow limited slots with warnings, suggest 2 alternatives for full slots

**Error Handling**:

| Status | Meaning                  | Response to Client                              |
|--------|--------------------------|------------------------------------------------|
| 429    | Rate limit exceeded      | "Too many requests. Please try again."          |
| 402    | AI credits exhausted     | "AI service credits exhausted."                 |
| 500    | Server/gateway error     | "Something went wrong. Please try again."       |

**Streaming**: The edge function pipes the AI gateway's response body directly to the client without buffering, preserving the SSE format.

---

## 7. Data Layer

### 7.1 Menu Data (`restaurantData.ts`)

**5 categories, 24 items total**:

| Category                 | Items | Price Range   | Tags                              |
|--------------------------|-------|---------------|-----------------------------------|
| Starters — Vegetarian    | 4     | ₹260–₹350     | bestseller, vegan                 |
| Starters — Non-Vegetarian| 4     | ₹420–₹550     | bestseller                        |
| Main Course              | 7     | ₹350–₹680     | bestseller, vegetarian, gluten-free|
| Desserts                 | 4     | ₹200–₹320     | bestseller, vegan, gluten-free    |
| Beverages                | 5     | ₹120–₹450     | —                                 |

### 7.2 Availability Schedule

- **7 days** (Monday–Sunday), each with **lunch** and **dinner** slots
- Each slot has: `time`, `status` (`available` | `limited` | `full`), and per-size table counts
- **Table sizes**: 2, 4, 6, 8 guests
- **Peak times**: Friday/Saturday evenings are mostly `full` or `limited`

### 7.3 Helper Functions

| Function                              | Input                        | Output                                      |
|---------------------------------------|------------------------------|---------------------------------------------|
| `getMenuSummary()`                    | —                            | Overview string with highlights              |
| `getMenuByCategory(query)`            | Search string                | Markdown-formatted filtered menu             |
| `checkAvailability(day, time, guests)`| Day, time, guest count       | `{ available, slot?, alternatives? }`        |

### 7.4 TypeScript Interfaces

```typescript
interface MenuItem { name: string; price: string; tags?: string[] }
interface MenuCategory { category: string; items: MenuItem[] }
type SlotStatus = "available" | "limited" | "full"
interface TimeSlot { time: string; status: SlotStatus; tables: { size: number; available: number }[] }
interface DaySchedule { day: string; lunch: TimeSlot[]; dinner: TimeSlot[] }
```

---

## 8. Legacy Bot Engine

The project includes a **rule-based bot engine** (`botEngine.ts` + `bot/` modules) that is **not active in production**. It was the original implementation before the AI gateway integration.

### Components

| Module          | Purpose                                                              |
|-----------------|----------------------------------------------------------------------|
| `intents.ts`    | Regex-based intent detection (reserve, menu, cancel, modify, hours, greeting, thanks, bye) |
| `parsers.ts`    | NLP extraction for day, time, guest count, phone number, name        |
| `types.ts`      | State machine types: `idle` → `collecting` → `confirm` → (booked)   |
| `botEngine.ts`  | Orchestrator with slot-filling, availability checking, confirmation flow |

### Supported Intents

| Intent     | Trigger Keywords                                    |
|------------|-----------------------------------------------------|
| `reserve`  | reserve, book, table, reservation, booking, seat    |
| `menu`     | menu, dish, food, starter, dessert, vegan, biryani  |
| `cancel`   | cancel, remove, delete                              |
| `modify`   | change, modify, update, reschedule                  |
| `hours`    | hour, open, close, timing, available, availability  |
| `greeting` | hi, hello, hey, good morning/evening/afternoon      |
| `thanks`   | thank, thanks, thx                                  |
| `bye`      | bye, goodbye, see you                               |

---

## 9. Design System

### Typography
- **Display font**: Playfair Display (headings, brand name)
- **Body font**: Lato (messages, UI text)

### Color Tokens (HSL)
- `--background` / `--foreground` — Page base
- `--primary` / `--primary-foreground` — Brand accent (buttons, bot avatar)
- `--chat-bot` / `--chat-bot-foreground` — Bot message bubble
- `--chat-user` / `--chat-user-foreground` — User message bubble
- `--card` / `--border` — Input field, quick action buttons
- `--muted` / `--muted-foreground` — Secondary text, placeholders
- `--accent` — Online indicator pulse

### Layout
- **Desktop**: 45% hero panel / 55% chat panel (side-by-side)
- **Mobile**: Full-width chat with compact header
- **Breakpoint**: `lg` (1024px) toggles between layouts

### Animations
- **Hero panel**: Fade-in + slide-up on page load (Framer Motion, 0.6s)
- **Chat messages**: Fade-in + slide-up on mount (0.3s, ease-out)
- **Typing indicator**: Three bouncing dots with staggered delays (0ms, 150ms, 300ms)
- **Online indicator**: Pulsing green dot (`animate-pulse`)

---

## 10. Environment Variables

| Variable                          | Scope        | Purpose                                |
|----------------------------------|--------------|----------------------------------------|
| `VITE_SUPABASE_URL`             | Client-side  | Base URL for edge function calls       |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client-side  | API key for Authorization header       |
| `LOVABLE_API_KEY`               | Server-side  | AI Gateway authentication (secret)     |

---

## 11. Error Handling Strategy

| Error Type              | Detection                      | User Experience                              |
|-------------------------|--------------------------------|----------------------------------------------|
| Rate limiting (429)     | HTTP status from edge function | Toast: "Too many requests, try again"        |
| Credits exhausted (402) | HTTP status from edge function | Toast: "AI credits exhausted"                |
| Server error (500)      | HTTP status from edge function | Toast: "Something went wrong"                |
| Network failure         | `fetch` exception in chatApi   | Toast via `onError` callback                 |
| Missing API key         | `Deno.env.get()` returns null  | 500 response with descriptive error          |
| Malformed SSE           | JSON parse failure             | Data pushed back to buffer, retried on next chunk |

---

## 12. Development

### Prerequisites
- Node.js v18+
- npm or bun

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing

```bash
npm run test         # Run Vitest test suite
```

Test configuration is in `vitest.config.ts` with setup in `src/test/setup.ts`.

---


---

## 14. Future Considerations

- **Persistent reservations**: Store bookings in a database table with user auth
- **Chat history**: Persist conversations across sessions
- **Payment integration**: Accept deposits for premium reservations
- **Analytics**: Track popular dishes, peak booking times, conversation metrics
