import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, Deck, Rating, VocabData } from '../types';
import { loadData, saveData } from '../lib/storage';
import { createNewCardSchedule, isDue, scheduleReview } from '../lib/srs';
import { generateId } from '../lib/id';

interface DeckStats {
  total: number;
  due: number;
}

interface VocabContextValue {
  ready: boolean;
  decks: Deck[];
  cards: Card[];
  addDeck: (name: string, description?: string) => Deck;
  updateDeck: (deckId: string, updates: Partial<Pick<Deck, 'name' | 'description'>>) => void;
  deleteDeck: (deckId: string) => void;
  addCard: (deckId: string, term: string, translation: string, notes?: string) => Card;
  updateCard: (
    cardId: string,
    updates: Partial<Pick<Card, 'term' | 'translation' | 'notes'>>
  ) => void;
  deleteCard: (cardId: string) => void;
  reviewCard: (cardId: string, rating: Rating) => void;
  getCardsForDeck: (deckId: string) => Card[];
  getDueCardsForDeck: (deckId: string) => Card[];
  getDeckStats: (deckId: string) => DeckStats;
}

const VocabContext = createContext<VocabContextValue | undefined>(undefined);

export function VocabProvider({ children }: { children: React.ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    loadData().then((data) => {
      setDecks(data.decks);
      setCards(data.cards);
      hasLoaded.current = true;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    const data: VocabData = { decks, cards };
    saveData(data);
  }, [decks, cards]);

  const addDeck = useCallback((name: string, description?: string) => {
    const deck: Deck = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim(),
      createdAt: new Date().toISOString(),
    };
    setDecks((prev) => [...prev, deck]);
    return deck;
  }, []);

  const updateDeck = useCallback(
    (deckId: string, updates: Partial<Pick<Deck, 'name' | 'description'>>) => {
      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, ...updates } : d))
      );
    },
    []
  );

  const deleteDeck = useCallback((deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setCards((prev) => prev.filter((c) => c.deckId !== deckId));
  }, []);

  const addCard = useCallback(
    (deckId: string, term: string, translation: string, notes?: string) => {
      const card: Card = {
        id: generateId(),
        deckId,
        term: term.trim(),
        translation: translation.trim(),
        notes: notes?.trim(),
        createdAt: new Date().toISOString(),
        ...createNewCardSchedule(),
      };
      setCards((prev) => [...prev, card]);
      return card;
    },
    []
  );

  const updateCard = useCallback(
    (cardId: string, updates: Partial<Pick<Card, 'term' | 'translation' | 'notes'>>) => {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const reviewCard = useCallback((cardId: string, rating: Rating) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, ...scheduleReview(c, rating) } : c))
    );
  }, []);

  const getCardsForDeck = useCallback(
    (deckId: string) => cards.filter((c) => c.deckId === deckId),
    [cards]
  );

  const getDueCardsForDeck = useCallback(
    (deckId: string) => cards.filter((c) => c.deckId === deckId && isDue(c)),
    [cards]
  );

  const getDeckStats = useCallback(
    (deckId: string): DeckStats => {
      const deckCards = cards.filter((c) => c.deckId === deckId);
      return {
        total: deckCards.length,
        due: deckCards.filter((c) => isDue(c)).length,
      };
    },
    [cards]
  );

  const value = useMemo<VocabContextValue>(
    () => ({
      ready,
      decks,
      cards,
      addDeck,
      updateDeck,
      deleteDeck,
      addCard,
      updateCard,
      deleteCard,
      reviewCard,
      getCardsForDeck,
      getDueCardsForDeck,
      getDeckStats,
    }),
    [
      ready,
      decks,
      cards,
      addDeck,
      updateDeck,
      deleteDeck,
      addCard,
      updateCard,
      deleteCard,
      reviewCard,
      getCardsForDeck,
      getDueCardsForDeck,
      getDeckStats,
    ]
  );

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocab(): VocabContextValue {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error('useVocab must be used within a VocabProvider');
  return ctx;
}
