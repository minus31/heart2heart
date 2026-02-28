"use client"

import { useConversationStore } from "@/lib/store"
import { ConversationList } from "@/components/history/ConversationList"
import { History } from "lucide-react"

export default function HistoryPage() {
  const conversations = useConversationStore((s) => s.conversations);
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <History size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Conversation History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            You have {sorted.length} saved conversations.
          </p>
        </div>
      </header>

      <ConversationList conversations={sorted} />
    </div>
  );
}
