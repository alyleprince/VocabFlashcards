export type RootStackParamList = {
  Decks: undefined;
  DeckDetail: { deckId: string };
  AddEditCard: { deckId: string; cardId?: string };
  Study: { deckId: string };
};
