import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { Message } from "./ChatWindow";
import { UtensilsCrossed, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1">
          <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? "bg-chat-bot text-chat-bot-foreground rounded-tl-sm"
            : "bg-chat-user text-chat-user-foreground rounded-tr-sm"
        }`}
      >
        {isBot ? (
          <div className="prose prose-sm max-w-none prose-strong:font-bold prose-li:my-0.5 [&_p]:my-1 [&_ul]:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
}
