export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export type CardStatus = 'unseen' | 'correct' | 'incorrect';

export interface Card {
  id: string;
  deckId: string;
  term: string;
  translation: string;
  notes?: string;
  createdAt: string;
  status: CardStatus;
  lastReviewed?: string;
}

export interface VocabData {
  decks: Deck[];
  cards: Card[];
}
