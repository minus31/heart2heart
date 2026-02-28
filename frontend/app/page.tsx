import { DeckGrid } from "@/components/home/DeckGrid"
import { DeckCard } from "@/components/home/DeckCard"
import { Sparkles } from "lucide-react"
import { Deck } from "@/lib/types"
import { readFileSync } from "fs"
import { join } from "path"

function getDecks(): Deck[] {
  try {
    const raw = readFileSync(join(process.cwd(), "public/data/cards.json"), "utf-8");
    return JSON.parse(raw).decks as Deck[];
  } catch {
    return [];
  }
}

export default function Home() {
  const decks = getDecks();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles size={16} />
          <span>Deepen Your Love</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Select Your Conversation Deck
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose a theme and start a journey of discovery with your partner.
          Speak from the heart, and let the conversation flow.
        </p>

        <p className="max-w-xl mx-auto text-sm font-medium text-rose-500 dark:text-rose-400">
          The first 4 decks below are based on Arthur Aron's 36 questions that lead to love. If you're just starting a relationship, we highly recommend giving them a try!
        </p>
      </header>

      <DeckGrid>
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            id={deck.id}
            theme={deck.theme}
            cardCount={deck.cards.length}
            description={deck.description ?? ""}
            firstCardId={deck.cards[0]?.id ?? "card-001"}
          />
        ))}
      </DeckGrid>
    </div>
  )
}
