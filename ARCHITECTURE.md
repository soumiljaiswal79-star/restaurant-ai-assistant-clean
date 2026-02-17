# 🏗️ Architecture — La Maison AI Restaurant Assistant

## High-Level Overview

La Maison is a single-page React application that acts as an AI-powered restaurant concierge. Users interact through a chat interface; all intelligence is handled by a backend edge function calling the AI Gateway (Google Gemini 3 Flash).

```
┌─────────────┐       SSE Stream        ┌──────────────────┐       HTTPS        ┌─────────────────────┐
│   Browser    │ ◄────────────────────── │  Edge Function   │ ◄───────────────── │   AI Gateway │
│  (React SPA) │ ──────────────────────► │  /functions/v1/  │ ──────────────────► │  Gemini 3 Flash     │
│              │   POST /chat            │  chat            │   POST /v1/chat/   │                     │
└─────────────┘                          └──────────────────┘   completions      └─────────────────────┘
```

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| UI          | React 18, TypeScript, Tailwind CSS, shadcn      |
| Animations  | Framer Motion                                   |
| Markdown    | react-markdown                                  |
| Build       | Vite                                            |
| Backend     | Cloud (Supabase Edge Functions, Deno)   |
| AI Model    | Google Gemini 3 Flash                           |
| Streaming   | Server-Sent Events (SSE)                        |

## Directory Structure

```
src/
├── assets/                  # Static assets (hero image)
├── components/
│   ├── ChatWindow.tsx       # Main chat UI — message list, input, quick actions
│   ├── ChatMessage.tsx      # Single message bubble with markdown rendering
│   ├── NavLink.tsx          # Navigation helper
│   └── ui/                  # shadcn/ui primitives (button, card, dialog, etc.)
├── data/
│   └── restaurantData.ts    # Menu items, availability schedule, helper functions
├── lib/
│   ├── chatApi.ts           # SSE streaming client — parses token-by-token
│   ├── botEngine.ts         # Legacy local bot engine (not active in production)
│   └── bot/                 # Bot engine sub-modules
│       ├── intents.ts       # Intent detection (reserve, menu, cancel, etc.)
│       ├── parsers.ts       # NLP parsers (day, time, guests, phone, name)
│       └── types.ts         # Shared types (Message, ReservationDetails, BotContext)
├── pages/
│   ├── Index.tsx            # Landing page — hero panel + chat panel
│   └── NotFound.tsx         # 404 page
├── hooks/                   # Custom React hooks (use-mobile, use-toast)
└── integrations/
    └── supabase/
        ├── client.ts        # Auto-generated Supabase client
        └── types.ts         # Auto-generated database types

supabase/
├── config.toml              # Supabase project configuration
└── functions/
    └── chat/
        └── index.ts         # Edge function — proxies AI gateway with system prompt
```

## Data Flow

### 1. User sends a message

```
User types message
  → ChatWindow.sendMessage()
  → Appends user message to local state
  → Calls streamChat() with full conversation history
```

### 2. Streaming request

```
streamChat() in chatApi.ts
  → POST to /functions/v1/chat with { messages: [...history] }
  → Authorization via VITE_SUPABASE_PUBLISHABLE_KEY
  → Returns ReadableStream (SSE)
```

### 3. Edge function processing

```
supabase/functions/chat/index.ts
  → Prepends system prompt (restaurant persona, menu, rules)
  → Forwards to AI Gateway (Gemini 3 Flash)
  → Streams response body back to client
  → Handles 429 (rate limit) and 402 (credits exhausted) errors
```

### 4. Token-by-token rendering

```
streamChat() reads SSE chunks
  → Parses "data: {json}" lines
  → Extracts choices[0].delta.content
  → Calls onDelta() per token
  → ChatWindow updates the last bot message progressively
  → onDone() when "[DONE]" received
```

## Key Components

### `ChatWindow.tsx`
- Manages message state (`Message[]`) and streaming flag
- Converts internal messages to API format (`user`/`assistant`)
- Renders quick-action buttons ("Book a table", "View menu", "Check availability")
- Auto-scrolls to latest message

### `ChatMessage.tsx`
- Renders bot messages with `react-markdown` (supports bold, lists, etc.)
- User messages rendered as plain text
- Entry animation via Framer Motion
- Avatar icons: restaurant logo for bot, user icon for user

### `chatApi.ts`
- Robust SSE parser handling CRLF, partial JSON, keepalive comments
- Callbacks: `onDelta`, `onDone`, `onError`
- Final buffer flush for edge cases

### `chat/index.ts` (Edge Function)
- System prompt defines restaurant personality, menu, hours, booking rules
- Enforces response length (<80 words), no emojis, no AI mentions
- Streams directly from AI gateway to client (no buffering)

## Restaurant Data (`restaurantData.ts`)

### Menu
- 5 categories: Starters (Veg/Non-Veg), Main Course, Desserts, Beverages
- Each item has name, price (₹), and optional tags (bestseller, vegan, gluten-free)

### Availability Schedule
- 7-day weekly schedule with lunch (12–2 PM) and dinner (7–9 PM) slots
- Each slot has a status: `available`, `limited`, or `full`
- Table sizes: 2, 4, 6, 8 guests with per-size availability counts

### Helper Functions
- `getMenuSummary()` — overview response
- `getMenuByCategory(query)` — filtered menu with markdown formatting
- `checkAvailability(day, time, guests)` — returns availability + alternatives

## Legacy Bot Engine (`botEngine.ts`)

A fully local, rule-based conversation engine (not currently used in production). Includes:
- State machine: `idle` → `collecting` → `confirm` → (booked)
- Intent detection, NLP parsing, slot-filling for reservations
- Availability checking with alternative suggestions

## Design System

- **Fonts**: Playfair Display (display), Lato (body)
- **Theme**: Dark-first with semantic tokens (`--background`, `--primary`, `--chat-bot`, `--chat-user`)
- **Chat bubbles**: Custom `chat-bot` and `chat-user` color tokens
- **Layout**: Split-panel on desktop (45% hero / 55% chat), full-width chat on mobile

## Environment Variables

| Variable                          | Purpose                              |
|----------------------------------|--------------------------------------|
| `VITE_SUPABASE_URL`             | Backend URL for edge functions       |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key for auth headers      |
| `API_KEY` (server-side)         | AI Gateway authentication            |

## Error Handling

- **429 Too Many Requests** — Toast notification, user retries
- **402 Payment Required** — Toast notification about credits
- **500 Server Error** — Generic error toast
- **Network failures** — Caught in `streamChat`, surfaced via `onError`
