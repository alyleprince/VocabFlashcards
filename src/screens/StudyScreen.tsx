import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { Flashcard } from '../components/Flashcard';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;

export function StudyScreen({ route, navigation }: Props) {
  const { deckId, mode, direction } = route.params;
  const { getCardsForDeck, getIncorrectCardsForDeck, markCard, cards } = useVocab();
  // Snapshot the queue once so it doesn't change size mid-session as cards
  // get marked correct/incorrect.
  const [queue] = useState(() =>
    (mode === 'incorrect' ? getIncorrectCardsForDeck(deckId) : getCardsForDeck(deckId)).map(
      (c) => c.id
    )
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const currentCard = useMemo(
    () => cards.find((c) => c.id === queue[index]),
    [cards, queue, index]
  );

  const handleMark = (correct: boolean) => {
    if (!currentCard) return;
    markCard(currentCard.id, correct);
    if (correct) setCorrectCount((n) => n + 1);
    else setIncorrectCount((n) => n + 1);
    if (index + 1 >= queue.length) {
      navigation.goBack();
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (queue.length === 0 || !currentCard) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneTitle}>All done! 🎉</Text>
        <Text style={styles.doneSubtitle}>
          {correctCount + incorrectCount === 0
            ? 'Nothing to study here.'
            : `${correctCount} right, ${incorrectCount} wrong.`}
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
          term={currentCard.term}
          translation={currentCard.translation}
          notes={currentCard.notes}
          direction={direction}
        />
      </View>
      <Text style={styles.instructions}>
        {direction === 'term-to-translation'
          ? 'Tap the translation area to reveal it'
          : 'Tap the card to reveal the Spanish word'}
      </Text>
      <View style={styles.ratingRow}>
        <Pressable
          style={[styles.ratingButton, styles.incorrectButton]}
          onPress={() => handleMark(false)}
        >
          <Text style={styles.ratingButtonText}>✕ Wrong</Text>
        </Pressable>
        <Pressable
          style={[styles.ratingButton, styles.correctButton]}
          onPress={() => handleMark(true)}
        >
          <Text style={styles.ratingButtonText}>✓ Right</Text>
        </Pressable>
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
  incorrectButton: { backgroundColor: colors.danger },
  correctButton: { backgroundColor: colors.success },
  ratingButtonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
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
