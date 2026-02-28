"use client"

import { useState } from "react"
import { useConversationStore } from "@/lib/store"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { ChatInput } from "@/components/chat/ChatInput"
import { MessageCircle, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const EXAMPLE_QUESTIONS = [
  "What was it that I said earlier about my happiest moment?",
  "Based on our conversations, what are the main topics we usually talk about?",
  "Can you summarize what we both value the most according to our history?",
];

export default function ChatPage() {
  const conversations = useConversationStore((s) => s.conversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prefill, setPrefill] = useState<string | undefined>();

  async function handleSend(text: string) {
    setPrefill(undefined);
    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_history: messages,
          context: conversations, // 전체 conversation history 주입
        }),
      });
      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status} ${response.statusText}`);
      }
      const { reply } = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"
          } shrink-0 transition-all duration-300 overflow-hidden border-r border-border bg-card flex flex-col`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={14} className="text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Example Questions
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Click to use as a starting point.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {EXAMPLE_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => setPrefill(q)}
              className="w-full text-left p-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors leading-snug"
            >
              {q}
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle size={16} />
            <span>
              {conversations.length > 0
                ? `${conversations.length} conversation(s) in context`
                : "No conversations yet"}
            </span>
          </div>
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} disabled={isLoading} prefill={prefill} />
      </div>
    </div>
  );
}
