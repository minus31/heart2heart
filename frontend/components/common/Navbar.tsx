import Link from "next/link"
import { History, MessageCircleHeart, Home } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="bg-primary text-white p-1 rounded-lg">
            <MessageCircleHeart size={24} />
          </div>
          <span className="hidden sm:inline-block">HeartToHeart</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Home size={18} />
            <span className="hidden sm:inline-block">Home</span>
          </Link>
          <Link 
            href="/history" 
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <History size={18} />
            <span className="hidden sm:inline-block">History</span>
          </Link>
          <Link 
            href="/chat" 
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircleHeart size={18} />
            <span className="hidden sm:inline-block">Chat</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
