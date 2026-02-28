export interface TranscriptEntry {
  speaker: 'A' | 'B';
  text: string;
}

export interface Summaries {
  speakerA: string;
  speakerB: string;
  overall: string;
}

export interface Conversation {
  id: string;
  deckId: string;
  cardId: string;
  question: string;
  createdAt: string;
  transcript: TranscriptEntry[];
  summaries: Summaries;
  speakerAName?: string;
  speakerBName?: string;
}

export interface Card {
  id: string;
  question: string;
}

export interface Deck {
  id: string;
  theme: string;
  description?: string;
  cards: Card[];
}
