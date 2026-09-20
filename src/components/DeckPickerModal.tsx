import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Deck } from '../types';

interface DeckPickerModalProps {
  visible: boolean;
  title: string;
  decks: Deck[];
  onSelect: (deck: Deck) => void;
  onCancel: () => void;
}

export function DeckPickerModal({ visible, title, decks, onSelect, onCancel }: DeckPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={decks}
            keyExtractor={(d) => d.id}
            renderItem={({ item }) => (
              <Pressable style={styles.option} onPress={() => onSelect(item)}>
                <Text style={styles.optionText}>{item.name}</Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: { fontSize: 16, color: colors.text },
  cancelButton: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs },
  cancelButtonText: { color: colors.textMuted, fontWeight: '600' },
});
