import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface FlashcardProps {
  front: string;
  back: string;
  notes?: string;
  cardKey: string;
}

export function Flashcard({ front, back, notes, cardKey }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFlipped(false);
    flipAnim.setValue(0);
  }, [cardKey, flipAnim]);

  const toggleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <Pressable onPress={toggleFlip} style={styles.wrapper}>
      <Animated.View
        style={[styles.card, styles.cardFace, { transform: [{ rotateY: frontRotate }] }]}
      >
        <Text style={styles.label}>TERM</Text>
        <Text style={styles.term}>{front}</Text>
        <Text style={styles.hint}>Tap to reveal</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          styles.cardFace,
          styles.cardBack,
          styles.cardBackAbsolute,
          { transform: [{ rotateY: backRotate }] },
        ]}
      >
        <Text style={[styles.label, styles.labelOnDark]}>TRANSLATION</Text>
        <Text style={styles.translation}>{back}</Text>
        {!!notes && <Text style={styles.notes}>{notes}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 1.3,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
  },
  cardBack: {
    backgroundColor: colors.cardBack,
  },
  cardBackAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  labelOnDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  term: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
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
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.textMuted,
  },
});
