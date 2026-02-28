import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

interface QuestionCardProps {
  question: string
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="border-none bg-transparent shadow-none py-12">
      <CardContent className="flex flex-col items-center text-center p-0">
        <Quote className="text-primary/20 mb-8" size={64} fill="currentColor" />
        <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-foreground/90 max-w-3xl">
          {question}
        </h2>
      </CardContent>
    </Card>
  )
}
