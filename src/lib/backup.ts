import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Card, Deck, VocabData } from '../types';

const EXPORT_FORMAT = 'vocabflashcards';
const EXPORT_VERSION = 1;

interface ExportPayload {
  format: typeof EXPORT_FORMAT;
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  decks: Deck[];
  cards: Card[];
}

function serialize(data: VocabData): string {
  const payload: ExportPayload = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    decks: data.decks,
    cards: data.cards,
  };
  return JSON.stringify(payload, null, 2);
}

function isDeck(value: any): value is Deck {
  return value && typeof value.id === 'string' && typeof value.name === 'string';
}

function isCard(value: any): value is Card {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.deckId === 'string' &&
    typeof value.term === 'string' &&
    typeof value.translation === 'string'
  );
}

function parse(raw: string): VocabData {
  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (payload?.format !== EXPORT_FORMAT || !Array.isArray(payload.decks) || !Array.isArray(payload.cards)) {
    throw new Error('That file is not a Vocab Flashcards export.');
  }
  const decks = payload.decks.filter(isDeck);
  const cards = payload.cards.filter(isCard);
  if (decks.length === 0 && cards.length === 0) {
    throw new Error('That file has no decks or cards in it.');
  }
  return { decks, cards };
}

function timestampedFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `vocabflashcards-export-${stamp}.json`;
}

export async function exportVocabData(data: VocabData): Promise<void> {
  const file = new File(Paths.cache, timestampedFileName());
  file.create({ overwrite: true, intermediates: true });
  file.write(serialize(data));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Export Vocab Flashcards',
  });
}

export async function pickAndParseImportFile(): Promise<VocabData | null> {
  const picked = await File.pickFileAsync({ mimeTypes: '*/*' });
  if (picked.canceled || !picked.result) return null;
  const raw = await picked.result.text();
  return parse(raw);
}
