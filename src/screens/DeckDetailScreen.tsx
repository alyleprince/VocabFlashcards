import React, { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { colors, radius, spacing } from '../theme';
import { Card } from '../types';
import { isDue } from '../lib/srs';

type Props = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;

export function DeckDetailScreen({ route, navigation }: Props) {
  const { deckId } = route.params;
  const { decks, getCardsForDeck, deleteCard, getDeckStats } = useVocab();
  const deck = decks.find((d) => d.id === deckId);
  const cards = getCardsForDeck(deckId);
  const stats = getDeckStats(deckId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: deck?.name ?? 'Deck' });
  }, [navigation, deck]);

  const renderCard = ({ item }: { item: Card }) => (
    <Pressable
      style={styles.cardRow}
      onPress={() => navigation.navigate('AddEditCard', { deckId, cardId: item.id })}
      onLongPress={() => deleteCard(item.id)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.term}>{item.term}</Text>
        <Text style={styles.translation}>{item.translation}</Text>
      </View>
      {isDue(item) ? (
        <View style={styles.duePill}>
          <Text style={styles.duePillText}>due</Text>
        </View>
      ) : (
        <Text style={styles.scheduled}>
          in {Math.max(0, Math.ceil((new Date(item.dueDate).getTime() - Date.now()) / 86400000))}d
        </Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={[styles.studyButton, stats.due === 0 && styles.studyButtonDisabled]}
          disabled={stats.due === 0}
          onPress={() => navigation.navigate('Study', { deckId })}
        >
          <Text style={styles.studyButtonText}>
            {stats.due === 0 ? 'No cards due' : `Study ${stats.due} due card${stats.due === 1 ? '' : 's'}`}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={cards}
        keyExtractor={(c) => c.id}
        renderItem={renderCard}
        contentContainerStyle={cards.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No cards yet</Text>
            <Text style={styles.emptySubtitle}>Add your first vocabulary card below.</Text>
          </View>
        }
      />
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditCard', { deckId })}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: 0 },
  studyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  studyButtonDisabled: { backgroundColor: colors.border },
  studyButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  listContent: { padding: spacing.md, gap: spacing.sm },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  cardRow: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  term: { fontSize: 16, fontWeight: '700', color: colors.text },
  translation: { marginTop: 2, fontSize: 14, color: colors.textMuted },
  duePill: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  duePillText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  scheduled: { fontSize: 12, color: colors.textMuted },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
