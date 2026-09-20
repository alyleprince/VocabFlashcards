import * as Speech from 'expo-speech';

export function speakText(text: string, language?: string): void {
  if (!text.trim()) return;
  Speech.stop();
  Speech.speak(text, language ? { language } : undefined);
}
