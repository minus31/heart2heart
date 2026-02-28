import { TranscriptEntry } from "@/lib/types"

interface TranscriptViewerProps {
  transcript: TranscriptEntry[]
  speakerAName?: string
  speakerBName?: string
}

export function TranscriptViewer({ transcript, speakerAName = "A", speakerBName = "B" }: TranscriptViewerProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-5">
        <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-3">
          Full Conversation
        </h3>
        <p className="text-sm text-muted-foreground">No conversation content available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border p-5">
      <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-4">
        Full Conversation
      </h3>
      <div className="flex flex-col gap-3">
        {transcript.map((entry, i) => {
          const isA = entry.speaker === "A";
          const speakerName = isA ? speakerAName : speakerBName;
          const labelClass = isA ? "text-rose-500" : "text-slate-500";

          return (
            <div key={i} className="flex gap-2">
              <span className={`text-xs font-bold pt-0.5 w-16 shrink-0 truncate ${labelClass}`}>
                {speakerName}
              </span>
              <p className="text-sm leading-relaxed text-foreground/80 flex-1">{entry.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
