import * as Speech from 'expo-speech';

// Cards are always spoken in Spanish, the language being learned.
export const SPOKEN_LANGUAGE = 'es-ES';

export function speakTerm(text: string): void {
  if (!text.trim()) return;
  Speech.stop();
  Speech.speak(text, { language: SPOKEN_LANGUAGE });
}
