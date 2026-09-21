export type StudyMode = 'all' | 'incorrect';
export type StudyDirection = 'term-to-translation' | 'translation-to-term';

export type RootStackParamList = {
  Decks: undefined;
  DeckDetail: { deckId: string };
  AddEditCard: { deckId: string; cardId?: string };
  Study: { deckId: string; mode: StudyMode; direction: StudyDirection };
  Backup: undefined;
};
