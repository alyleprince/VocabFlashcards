import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { Flashcard } from '../components/Flashcard';
import { colors, radius, spacing } from '../theme';
import { Rating } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;

const RATING_BUTTONS: { rating: Rating; label: string; color: string }[] = [
  { rating: 'again', label: 'Again', color: colors.danger },
  { rating: 'hard', label: 'Hard', color: colors.warning },
  { rating: 'good', label: 'Good', color: colors.primary },
  { rating: 'easy', label: 'Easy', color: colors.success },
];

export function StudyScreen({ route, navigation }: Props) {
  const { deckId } = route.params;
  const { getDueCardsForDeck, reviewCard } = useVocab();
  // Snapshot the due queue once so it doesn't shrink mid-session as cards
  // get rescheduled out of "due".
  const [queue] = useState(() => getDueCardsForDeck(deckId).map((c) => c.id));
  const { cards } = useVocab();
  const [index, setIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentCard = useMemo(
    () => cards.find((c) => c.id === queue[index]),
    [cards, queue, index]
  );

  const handleRate = (rating: Rating) => {
    if (!currentCard) return;
    reviewCard(currentCard.id, rating);
    setReviewedCount((n) => n + 1);
    if (index + 1 >= queue.length) {
      navigation.goBack();
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!currentCard) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneTitle}>All done! 🎉</Text>
        <Text style={styles.doneSubtitle}>
          You reviewed {reviewedCount} card{reviewedCount === 1 ? '' : 's'}.
        </Text>
        <Pressable style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Back to deck</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {index + 1} / {queue.length}
      </Text>
      <View style={styles.cardWrapper}>
        <Flashcard
          cardKey={currentCard.id}
          front={currentCard.term}
          back={currentCard.translation}
          notes={currentCard.notes}
        />
      </View>
      <Text style={styles.instructions}>Tap the card to flip, then rate your recall</Text>
      <View style={styles.ratingRow}>
        {RATING_BUTTONS.map((b) => (
          <Pressable
            key={b.rating}
            style={[styles.ratingButton, { backgroundColor: b.color }]}
            onPress={() => handleRate(b.rating)}
          >
            <Text style={styles.ratingButtonText}>{b.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  progress: { textAlign: 'center', color: colors.textMuted, fontWeight: '600', marginBottom: spacing.md },
  cardWrapper: { flex: 1, justifyContent: 'center' },
  instructions: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  ratingRow: { flexDirection: 'row', gap: spacing.sm },
  ratingButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ratingButtonText: { color: colors.white, fontWeight: '700' },
  doneContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  doneTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  doneSubtitle: { marginTop: spacing.sm, fontSize: 15, color: colors.textMuted },
  doneButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  doneButtonText: { color: colors.white, fontWeight: '700' },
});
