import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { colors, radius, spacing } from '../theme';
import { Deck } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Decks'>;

export function DecksScreen({ navigation }: Props) {
  const { decks, addDeck, deleteDeck, getDeckStats } = useVocab();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openModal = () => {
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const submit = () => {
    if (!name.trim()) return;
    addDeck(name, description);
    setModalVisible(false);
  };

  const renderDeck = ({ item }: { item: Deck }) => {
    const stats = getDeckStats(item.id);
    return (
      <Pressable
        style={styles.deckCard}
        onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
        onLongPress={() => deleteDeck(item.id)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.deckName}>{item.name}</Text>
          {!!item.description && (
            <Text style={styles.deckDescription}>{item.description}</Text>
          )}
          <Text style={styles.deckMeta}>
            {stats.total} card{stats.total === 1 ? '' : 's'}
          </Text>
        </View>
        {stats.due > 0 && (
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>{stats.due} due</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={decks}
        keyExtractor={(d) => d.id}
        renderItem={renderDeck}
        contentContainerStyle={
          decks.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No decks yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a deck to start collecting vocabulary.
            </Text>
          </View>
        }
      />
      <Pressable style={styles.fab} onPress={openModal}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New deck</Text>
            <TextInput
              style={styles.input}
              placeholder="Deck name (e.g. Spanish Basics)"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={submit}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  deckCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  deckName: { fontSize: 17, fontWeight: '700', color: colors.text },
  deckDescription: { marginTop: 2, fontSize: 13, color: colors.textMuted },
  deckMeta: { marginTop: spacing.xs, fontSize: 12, color: colors.textMuted },
  dueBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dueBadgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: colors.background },
  cancelButtonText: { color: colors.textMuted, fontWeight: '600' },
  saveButton: { backgroundColor: colors.primary },
  saveButtonText: { color: colors.white, fontWeight: '700' },
});
