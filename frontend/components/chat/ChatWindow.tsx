import { useEffect, useRef } from "react"
import { ChatMessage } from "./ChatMessage"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
          <div>
            <p className="font-medium">Ask anything about your conversations.</p>
            <p className="text-sm mt-1">Try one of the example questions on the left.</p>
          </div>
        </div>
      )}
      {messages.map((msg, i) => (
        <ChatMessage key={i} role={msg.role} content={msg.content} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground">
            <span className="animate-pulse">Generating response...</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
