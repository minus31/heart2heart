import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"

interface CardNavigationProps {
  onPrevious: () => void
  onNext: () => void
  onEnd: () => void
  isFirst: boolean
  isLast: boolean
  isProcessing?: boolean
  isDone?: boolean
}

export function CardNavigation({
  onPrevious,
  onNext,
  onEnd,
  isFirst,
  isLast,
  isProcessing = false,
  isDone = false,
}: CardNavigationProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto py-8 px-4 gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst || isProcessing}
        className="flex-1 max-w-[150px] rounded-2xl h-14 font-semibold text-muted-foreground"
      >
        <ChevronLeft size={20} />
        Previous
      </Button>

      <Button
        variant="secondary"
        onClick={onEnd}
        disabled={isProcessing || isDone}
        className="flex-1 max-w-[240px] rounded-2xl h-14 font-bold text-base bg-rose-100 hover:bg-rose-200 text-rose-600 border-2 border-rose-200 disabled:opacity-60"
      >
        <Save size={20} className="mr-2" />
        {isProcessing ? "Processing..." : isDone ? "Conversation Saved" : "End Conversation"}
      </Button>

      <Button
        variant="default"
        onClick={onNext}
        disabled={isProcessing}
        className="flex-1 max-w-[150px] rounded-2xl h-14 font-bold text-base shadow-lg shadow-primary/20"
      >
        {isLast ? "Finish Deck" : "Next"}
        <ChevronRight size={20} className="ml-1" />
      </Button>
    </div>
  )
}
