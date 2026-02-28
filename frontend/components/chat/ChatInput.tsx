"use client"

import { useState, KeyboardEvent, useEffect } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  prefill?: string
}

export function ChatInput({ onSend, disabled, prefill }: ChatInputProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (prefill) setValue(prefill);
  }, [prefill]);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex items-end gap-2 max-w-full">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your message... (Enter to send)"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-input bg-muted px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground disabled:opacity-50 max-h-32 overflow-y-auto"
          style={{ minHeight: "42px" }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
