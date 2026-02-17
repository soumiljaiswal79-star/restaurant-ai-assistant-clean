import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { streamChat } from "@/lib/chatApi";
import { toast } from "sonner";

export interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

const GREETING = "Welcome to La Maison! I can help you book a table, browse the menu, or check availability. What can I do for you?";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "bot", content: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  /** Convert our Message[] to the API format (only user/assistant) */
  function toApiMessages(msgs: Message[]) {
    return msgs
      .filter((m) => m.id !== "greeting" || m.role === "bot")
      .map((m) => ({
        role: m.role === "bot" ? "assistant" as const : "user" as const,
        content: m.content,
      }));
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);

      const botId = (Date.now() + 1).toString();
      let accumulated = "";

      // Build history including the new user message
      const history = [...toApiMessages(messages), { role: "user" as const, content: trimmed }];

      await streamChat({
        messages: history,
        onDelta: (chunk) => {
          accumulated += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === botId) {
              return prev.map((m) => (m.id === botId ? { ...m, content: accumulated } : m));
            }
            return [...prev, { id: botId, role: "bot", content: accumulated, timestamp: new Date() }];
          });
        },
        onDone: () => {
          setIsStreaming(false);
        },
        onError: (msg) => {
          setIsStreaming(false);
          toast.error(msg);
        },
      });
    },
    [input, isStreaming, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== "bot" && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1">
              <span className="text-primary-foreground text-xs font-bold">LM</span>
            </div>
            <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {["Book a table", "View menu", "Check availability"].map((action) => (
          <button
            key={action}
            onClick={() => sendMessage(action)}
            disabled={isStreaming}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-foreground hover:bg-accent transition-colors font-body disabled:opacity-40"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
