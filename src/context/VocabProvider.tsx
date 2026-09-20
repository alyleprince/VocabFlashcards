import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, CardStatus, Deck, VocabData } from '../types';
import { loadData, saveData } from '../lib/storage';
import { generateId } from '../lib/id';

interface DeckStats {
  total: number;
  correct: number;
  incorrect: number;
  unseen: number;
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
  markCard: (cardId: string, correct: boolean) => void;
  copyCardToDeck: (cardId: string, targetDeckId: string) => void;
  moveCardToDeck: (cardId: string, targetDeckId: string) => void;
  getCardsForDeck: (deckId: string) => Card[];
  getIncorrectCardsForDeck: (deckId: string) => Card[];
  getDeckStats: (deckId: string) => DeckStats;
  importVocabData: (incoming: VocabData) => { decksAdded: number; cardsAdded: number };
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
        status: 'unseen',
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

  const markCard = useCallback((cardId: string, correct: boolean) => {
    const status: CardStatus = correct ? 'correct' : 'incorrect';
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, status, lastReviewed: new Date().toISOString() } : c
      )
    );
  }, []);

  const copyCardToDeck = useCallback((cardId: string, targetDeckId: string) => {
    setCards((prev) => {
      const source = prev.find((c) => c.id === cardId);
      if (!source) return prev;
      const copy: Card = {
        id: generateId(),
        deckId: targetDeckId,
        term: source.term,
        translation: source.translation,
        notes: source.notes,
        createdAt: new Date().toISOString(),
        status: 'unseen',
      };
      return [...prev, copy];
    });
  }, []);

  const moveCardToDeck = useCallback((cardId: string, targetDeckId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, deckId: targetDeckId } : c))
    );
  }, []);

  const getCardsForDeck = useCallback(
    (deckId: string) => cards.filter((c) => c.deckId === deckId),
    [cards]
  );

  const getIncorrectCardsForDeck = useCallback(
    (deckId: string) => cards.filter((c) => c.deckId === deckId && c.status === 'incorrect'),
    [cards]
  );

  const getDeckStats = useCallback(
    (deckId: string): DeckStats => {
      const deckCards = cards.filter((c) => c.deckId === deckId);
      return {
        total: deckCards.length,
        correct: deckCards.filter((c) => c.status === 'correct').length,
        incorrect: deckCards.filter((c) => c.status === 'incorrect').length,
        unseen: deckCards.filter((c) => c.status === 'unseen').length,
      };
    },
    [cards]
  );

  // Imports decks/cards from a backup file. Decks are matched onto existing
  // ones by name (case-insensitive) instead of id, since ids are meaningless
  // across devices; cards are skipped if a card with the same term +
  // translation already exists in the resolved deck, to keep re-imports
  // idempotent.
  const importVocabData = useCallback(
    (incoming: VocabData): { decksAdded: number; cardsAdded: number } => {
      let decksAdded = 0;
      let cardsAdded = 0;
      const nextDecks = [...decks];
      const deckIdMap = new Map<string, string>();

      for (const incomingDeck of incoming.decks) {
        const existing = nextDecks.find(
          (d) => d.name.trim().toLowerCase() === incomingDeck.name.trim().toLowerCase()
        );
        if (existing) {
          deckIdMap.set(incomingDeck.id, existing.id);
        } else {
          const newDeck: Deck = {
            id: generateId(),
            name: incomingDeck.name,
            description: incomingDeck.description,
            createdAt: incomingDeck.createdAt ?? new Date().toISOString(),
          };
          nextDecks.push(newDeck);
          deckIdMap.set(incomingDeck.id, newDeck.id);
          decksAdded += 1;
        }
      }

      const nextCards = [...cards];
      for (const incomingCard of incoming.cards) {
        const resolvedDeckId = deckIdMap.get(incomingCard.deckId);
        if (!resolvedDeckId) continue;
        const isDuplicate = nextCards.some(
          (c) =>
            c.deckId === resolvedDeckId &&
            c.term.trim().toLowerCase() === incomingCard.term.trim().toLowerCase() &&
            c.translation.trim().toLowerCase() === incomingCard.translation.trim().toLowerCase()
        );
        if (isDuplicate) continue;
        const status: CardStatus =
          incomingCard.status === 'correct' || incomingCard.status === 'incorrect'
            ? incomingCard.status
            : 'unseen';
        nextCards.push({
          id: generateId(),
          deckId: resolvedDeckId,
          term: incomingCard.term,
          translation: incomingCard.translation,
          notes: incomingCard.notes,
          createdAt: incomingCard.createdAt ?? new Date().toISOString(),
          status,
        });
        cardsAdded += 1;
      }

      setDecks(nextDecks);
      setCards(nextCards);
      return { decksAdded, cardsAdded };
    },
    [decks, cards]
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
      markCard,
      copyCardToDeck,
      moveCardToDeck,
      getCardsForDeck,
      getIncorrectCardsForDeck,
      getDeckStats,
      importVocabData,
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
      markCard,
      copyCardToDeck,
      moveCardToDeck,
      getCardsForDeck,
      getIncorrectCardsForDeck,
      getDeckStats,
      importVocabData,
    ]
  );

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocab(): VocabContextValue {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error('useVocab must be used within a VocabProvider');
  return ctx;
}
