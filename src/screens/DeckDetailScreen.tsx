import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, StudyDirection } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { exportVocabData } from '../lib/backup';
import { DeckPickerModal } from '../components/DeckPickerModal';
import { colors, radius, spacing } from '../theme';
import { Card, Deck } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;
type PickerMode = 'copy' | 'move' | null;

const STATUS_COLOR: Record<Card['status'], string> = {
  unseen: colors.border,
  correct: colors.success,
  incorrect: colors.danger,
};

export function DeckDetailScreen({ route, navigation }: Props) {
  const { deckId } = route.params;
  const { decks, getCardsForDeck, deleteCards, copyCardsToDeck, moveCardsToDeck, getDeckStats } =
    useVocab();
  const deck = decks.find((d) => d.id === deckId);
  const cards = getCardsForDeck(deckId);
  const stats = getDeckStats(deckId);
  const [exporting, setExporting] = useState(false);
  const [direction, setDirection] = useState<StudyDirection>('term-to-translation');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const selecting = selectedIds.size > 0;
  const otherDecks = decks.filter((d) => d.id !== deckId);

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCardPress = (item: Card) => {
    if (selecting) {
      toggleSelect(item.id);
    } else {
      navigation.navigate('AddEditCard', { deckId, cardId: item.id });
    }
  };

  const deleteSelected = () => {
    const count = selectedIds.size;
    Alert.alert(
      `Delete ${count} card${count === 1 ? '' : 's'}?`,
      "This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCards(Array.from(selectedIds));
            clearSelection();
          },
        },
      ]
    );
  };

  const pickTargetDeck = (target: Deck) => {
    if (!pickerMode) return;
    const ids = Array.from(selectedIds);
    if (pickerMode === 'copy') {
      copyCardsToDeck(ids, target.id);
      Alert.alert('Copied', `${ids.length} card${ids.length === 1 ? '' : 's'} added to ${target.name}.`);
    } else {
      moveCardsToDeck(ids, target.id);
    }
    setPickerMode(null);
    clearSelection();
  };

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

  const renderCard = ({ item }: { item: Card }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <Pressable
        style={[styles.cardRow, isSelected && styles.cardRowSelected]}
        onPress={() => handleCardPress(item)}
        onLongPress={() => toggleSelect(item.id)}
      >
        {selecting && (
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.term}>{item.term}</Text>
          <Text style={styles.translation}>{item.translation}</Text>
        </View>
        {!selecting && (
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {selecting ? (
        <View style={styles.selectionBar}>
          <View style={styles.selectionBarTop}>
            <Pressable onPress={clearSelection} hitSlop={8}>
              <Text style={styles.selectionCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.selectionCount}>{selectedIds.size} selected</Text>
          </View>
          <View style={styles.selectionActions}>
            <Pressable
              style={[
                styles.selectionActionButton,
                styles.copyActionButton,
                otherDecks.length === 0 && styles.selectionActionButtonDisabled,
              ]}
              onPress={() => setPickerMode('copy')}
              disabled={otherDecks.length === 0}
            >
              <Text style={styles.copyActionText}>Copy</Text>
            </Pressable>
            <Pressable
              style={[
                styles.selectionActionButton,
                styles.moveActionButton,
                otherDecks.length === 0 && styles.selectionActionButtonDisabled,
              ]}
              onPress={() => setPickerMode('move')}
              disabled={otherDecks.length === 0}
            >
              <Text style={styles.moveActionText}>Move</Text>
            </Pressable>
            <Pressable
              style={[styles.selectionActionButton, styles.deleteActionButton]}
              onPress={deleteSelected}
            >
              <Text style={styles.deleteActionText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <View style={styles.directionToggle}>
            <Pressable
              style={[
                styles.directionOption,
                direction === 'term-to-translation' && styles.directionOptionActive,
              ]}
              onPress={() => setDirection('term-to-translation')}
            >
              <Text
                style={[
                  styles.directionOptionText,
                  direction === 'term-to-translation' && styles.directionOptionTextActive,
                ]}
              >
                See word, guess meaning
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.directionOption,
                direction === 'translation-to-term' && styles.directionOptionActive,
              ]}
              onPress={() => setDirection('translation-to-term')}
            >
              <Text
                style={[
                  styles.directionOptionText,
                  direction === 'translation-to-term' && styles.directionOptionTextActive,
                ]}
              >
                See meaning, guess word
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.studyButton, stats.total === 0 && styles.studyButtonDisabled]}
            disabled={stats.total === 0}
            onPress={() => navigation.navigate('Study', { deckId, mode: 'all', direction })}
          >
            <Text style={styles.studyButtonText}>
              {stats.total === 0 ? 'No cards yet' : `Study all (${stats.total})`}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.reviseButton, stats.incorrect === 0 && styles.reviseButtonDisabled]}
            disabled={stats.incorrect === 0}
            onPress={() => navigation.navigate('Study', { deckId, mode: 'incorrect', direction })}
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
          <Text style={styles.hint}>Long-press a card to select multiple</Text>
        </View>
      )}
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
      {!selecting && (
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('AddEditCard', { deckId })}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      <DeckPickerModal
        visible={pickerMode !== null}
        title={pickerMode === 'copy' ? 'Copy to which deck?' : 'Move to which deck?'}
        decks={otherDecks}
        onSelect={pickTargetDeck}
        onCancel={() => setPickerMode(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  hint: { textAlign: 'center', fontSize: 12, color: colors.textMuted },
  directionToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  directionOption: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  directionOptionActive: { backgroundColor: colors.primary },
  directionOptionText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  directionOptionTextActive: { color: colors.white },
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
  selectionBar: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectionBarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectionCancel: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  selectionCount: { color: colors.text, fontWeight: '700', fontSize: 15 },
  selectionActions: { flexDirection: 'row', gap: spacing.sm },
  selectionActionButton: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  copyActionButton: { borderColor: colors.primary },
  copyActionText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  moveActionButton: { borderColor: colors.textMuted },
  moveActionText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  deleteActionButton: { borderColor: colors.danger },
  deleteActionText: { color: colors.danger, fontWeight: '600', fontSize: 14 },
  selectionActionButtonDisabled: { opacity: 0.4 },
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardRowSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: colors.white, fontSize: 13, fontWeight: '700' },
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
