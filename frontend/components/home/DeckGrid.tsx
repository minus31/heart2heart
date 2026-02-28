import { ReactNode } from "react"

interface DeckGridProps {
  children: ReactNode
}

export function DeckGrid({ children }: DeckGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
      {children}
    </div>
  )
}
