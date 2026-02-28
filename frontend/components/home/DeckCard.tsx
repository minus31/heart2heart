import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers } from "lucide-react"
import Link from "next/link"

interface DeckCardProps {
  id: string
  theme: string
  cardCount: number
  description: string
  firstCardId: string
}

export function DeckCard({ id, theme, cardCount, description, firstCardId }: DeckCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all border-2 border-transparent hover:border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Layers size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">{cardCount} Cards</span>
        </div>
        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
          {theme}
        </CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/card/${firstCardId}?deckId=${id}`}>
          <Button className="w-full" size="lg">
            Start Conversation
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
