"use client"

import { useParams, useRouter } from "next/navigation"
import { useConversationStore } from "@/lib/store"
import { SpeakerSummary } from "@/components/history/SpeakerSummary"
import { OverallSummary } from "@/components/history/OverallSummary"
import { TranscriptViewer } from "@/components/history/TranscriptViewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const conversations = useConversationStore((s) => s.conversations);
  const updateSpeakerName = useConversationStore((s) => s.updateSpeakerName);
  const conversation = conversations.find((c) => c.id === id);

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/history")}>
          <ArrowLeft size={16} className="mr-1" /> Back to list
        </Button>
      </div>
    );
  }

  const speakerAName = conversation.speakerAName ?? "A";
  const speakerBName = conversation.speakerBName ?? "B";

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full gap-1 mb-6"
        onClick={() => router.push("/history")}
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <div className="mb-8">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Question</p>
        <h1 className="text-xl font-bold leading-snug text-foreground">
          {conversation.question}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <SpeakerSummary
          speaker="A"
          name={speakerAName}
          summary={conversation.summaries.speakerA}
          onNameChange={(name) => updateSpeakerName(conversation.id, "A", name)}
        />

        <SpeakerSummary
          speaker="B"
          name={speakerBName}
          summary={conversation.summaries.speakerB}
          onNameChange={(name) => updateSpeakerName(conversation.id, "B", name)}
        />

        <OverallSummary summary={conversation.summaries.overall} />

        <TranscriptViewer
          transcript={conversation.transcript}
          speakerAName={speakerAName}
          speakerBName={speakerBName}
        />
      </div>
    </div>
  );
}
