export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  /** BCP 47 language code (e.g. "es-ES", "fr-FR") used to pronounce a card's term. */
  language?: string;
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
