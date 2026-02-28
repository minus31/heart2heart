"use client"

import { Conversation } from "@/lib/types"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"

interface ConversationListItemProps {
  conversation: Conversation
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/history/${conversation.id}`)}
      className="w-full text-left p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <MessageCircle size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground line-clamp-2 leading-snug">
            {conversation.question}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(conversation.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}
