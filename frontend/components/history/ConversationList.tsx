import { Conversation } from "@/lib/types"
import { ConversationListItem } from "./ConversationListItem"

interface ConversationListProps {
  conversations: Conversation[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No saved conversations yet.</p>
        <p className="mt-2 text-sm">Start a conversation from the home page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {conversations.map((conv) => (
        <ConversationListItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
