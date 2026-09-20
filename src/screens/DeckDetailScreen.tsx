import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { exportVocabData } from '../lib/backup';
import { colors, radius, spacing } from '../theme';
import { Card } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;

const STATUS_COLOR: Record<Card['status'], string> = {
  unseen: colors.border,
  correct: colors.success,
  incorrect: colors.danger,
};

export function DeckDetailScreen({ route, navigation }: Props) {
  const { deckId } = route.params;
  const { decks, getCardsForDeck, deleteCard, getDeckStats } = useVocab();
  const deck = decks.find((d) => d.id === deckId);
  const cards = getCardsForDeck(deckId);
  const stats = getDeckStats(deckId);
  const [exporting, setExporting] = useState(false);

  const exportThisDeck = async () => {
    if (!deck) return;
    setExporting(true);
    try {
      await exportVocabData({ decks: [deck], cards }, deck.name);
    } catch (err) {
      Alert.alert('Couldn’t export', err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: deck?.name ?? 'Deck',
      headerRight: () =>
        exporting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Pressable onPress={exportThisDeck} hitSlop={12} disabled={cards.length === 0}>
            <Text style={[styles.headerButton, cards.length === 0 && styles.headerButtonDisabled]}>
              Export
            </Text>
          </Pressable>
        ),
    });
  }, [navigation, deck, cards, exporting]);

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
      <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={[styles.studyButton, stats.total === 0 && styles.studyButtonDisabled]}
          disabled={stats.total === 0}
          onPress={() => navigation.navigate('Study', { deckId, mode: 'all' })}
        >
          <Text style={styles.studyButtonText}>
            {stats.total === 0 ? 'No cards yet' : `Study all (${stats.total})`}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.reviseButton, stats.incorrect === 0 && styles.reviseButtonDisabled]}
          disabled={stats.incorrect === 0}
          onPress={() => navigation.navigate('Study', { deckId, mode: 'incorrect' })}
        >
          <Text
            style={[
              styles.reviseButtonText,
              stats.incorrect === 0 && styles.reviseButtonTextDisabled,
            ]}
          >
            {stats.incorrect === 0 ? 'Nothing to revise' : `Revise wrong answers (${stats.incorrect})`}
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
  header: { padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  studyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  studyButtonDisabled: { backgroundColor: colors.border },
  studyButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  reviseButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  reviseButtonDisabled: { backgroundColor: 'transparent' },
  reviseButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  reviseButtonTextDisabled: { color: colors.textMuted },
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
  statusDot: { width: 12, height: 12, borderRadius: 6 },
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
  headerButton: { color: colors.primary, fontWeight: '600', fontSize: 15, paddingHorizontal: spacing.xs },
  headerButtonDisabled: { color: colors.textMuted },
});
