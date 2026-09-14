export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  deckId: string;
  term: string;
  translation: string;
  notes?: string;
  createdAt: string;
  interval: number; // days until next review
  repetitions: number; // consecutive successful reviews
  easeFactor: number; // SM-2 ease factor
  dueDate: string; // ISO date string
  lastReviewed?: string;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface VocabData {
  decks: Deck[];
  cards: Card[];
}
