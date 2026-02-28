"use client"

import { useState } from "react"
import { Pencil, Check } from "lucide-react"

interface SpeakerSummaryProps {
  speaker: "A" | "B"
  name: string
  summary: string
  onNameChange: (name: string) => void
}

export function SpeakerSummary({ speaker, name, summary, onNameChange }: SpeakerSummaryProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const accentClass = speaker === "A"
    ? "bg-rose-50 border-rose-200 text-rose-700"
    : "bg-slate-50 border-slate-200 text-slate-700";

  const badgeClass = speaker === "A"
    ? "bg-rose-100 text-rose-600"
    : "bg-slate-100 text-slate-600";

  function handleSave() {
    if (draft.trim()) onNameChange(draft.trim());
    setEditing(false);
  }

  return (
    <div className={`rounded-2xl border p-5 ${accentClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
          Speaker {speaker}
        </span>
        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-1 max-w-[160px] text-sm font-semibold bg-white border border-current rounded-lg px-2 py-0.5 outline-none"
            />
            <button onClick={handleSave} className="p-1 rounded-lg hover:bg-black/10 transition-colors">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setDraft(name); setEditing(true); }}
            className="flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            {name}
            <Pencil size={12} className="opacity-60" />
          </button>
        )}
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
    </div>
  );
}
