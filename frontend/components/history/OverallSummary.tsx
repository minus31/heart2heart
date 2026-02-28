interface OverallSummaryProps {
  summary: string
}

export function OverallSummary({ summary }: OverallSummaryProps) {
  return (
    <div className="rounded-2xl border border-accent bg-accent/30 p-5">
      <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-3">
        Overall Summary
      </h3>
      <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
    </div>
  );
}
