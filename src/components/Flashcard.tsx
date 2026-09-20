import React, { useEffect, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { speakTerm } from '../lib/speech';

interface FlashcardProps {
  front: string;
  back: string;
  notes?: string;
  cardKey: string;
}

export function Flashcard({ front, back, notes, cardKey }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [cardKey]);

  const toggleReveal = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRevealed((r) => !r);
  };

  return (
    <View style={styles.card}>
      <View style={styles.termRow}>
        <View style={styles.termTextWrapper}>
          <Text style={styles.label}>TERM</Text>
          <Text style={styles.term}>{front}</Text>
        </View>
        <Pressable style={styles.speakerButton} hitSlop={12} onPress={() => speakTerm(front)}>
          <Text style={styles.speakerIcon}>🔊</Text>
        </Pressable>
      </View>

      <Pressable style={styles.translationSection} onPress={toggleReveal}>
        {revealed ? (
          <>
            <Text style={[styles.label, styles.labelOnDark]}>TRANSLATION</Text>
            <Text style={styles.translation}>{back}</Text>
            {!!notes && <Text style={styles.notes}>{notes}</Text>}
          </>
        ) : (
          <Text style={styles.hint}>Tap to reveal translation</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  termTextWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  term: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  labelOnDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  speakerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  speakerIcon: {
    fontSize: 18,
  },
  translationSection: {
    backgroundColor: colors.cardBack,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  translation: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  notes: {
    marginTop: spacing.md,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
});
