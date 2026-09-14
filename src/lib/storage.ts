import AsyncStorage from '@react-native-async-storage/async-storage';
import { VocabData } from '../types';

const STORAGE_KEY = '@vocabflashcards/data';

export async function loadData(): Promise<VocabData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { decks: [], cards: [] };
    const parsed = JSON.parse(raw);
    return {
      decks: Array.isArray(parsed.decks) ? parsed.decks : [],
      cards: Array.isArray(parsed.cards) ? parsed.cards : [],
    };
  } catch {
    return { decks: [], cards: [] };
  }
}

export async function saveData(data: VocabData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
