import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useVocab } from '../context/VocabProvider';
import { DeckPickerModal } from '../components/DeckPickerModal';
import { colors, radius, spacing } from '../theme';
import { Deck } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditCard'>;
type PickerMode = 'copy' | 'move' | null;

export function AddEditCardScreen({ route, navigation }: Props) {
  const { deckId, cardId } = route.params;
  const { decks, cards, addCard, updateCard, deleteCard, copyCardsToDeck, moveCardsToDeck } =
    useVocab();
  const existing = cardId ? cards.find((c) => c.id === cardId) : undefined;

  const [term, setTerm] = useState(existing?.term ?? '');
  const [translation, setTranslation] = useState(existing?.translation ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit card' : 'New card' });
  }, [navigation, existing]);

  const canSave = term.trim().length > 0 && translation.trim().length > 0;
  const otherDecks = decks.filter((d) => d.id !== deckId);

  const save = () => {
    if (!canSave) return;
    if (existing) {
      updateCard(existing.id, { term, translation, notes });
    } else {
      addCard(deckId, term, translation, notes);
    }
    navigation.goBack();
  };

  const remove = () => {
    if (existing) {
      deleteCard(existing.id);
      navigation.goBack();
    }
  };

  const pickTargetDeck = (target: Deck) => {
    if (!existing || !pickerMode) return;
    if (pickerMode === 'copy') {
      copyCardsToDeck([existing.id], target.id);
      setPickerMode(null);
      Alert.alert('Copied', `"${existing.term}" was added to ${target.name}.`);
    } else {
      moveCardsToDeck([existing.id], target.id);
      setPickerMode(null);
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Term</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. gato"
          value={term}
          onChangeText={setTerm}
          autoFocus
        />
        <Text style={styles.label}>Translation</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. cat"
          value={translation}
          onChangeText={setTranslation}
        />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Example sentence, gender, pronunciation..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={save}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>{existing ? 'Save changes' : 'Add card'}</Text>
        </Pressable>

        {existing && otherDecks.length > 0 && (
          <View style={styles.deckActions}>
            <Pressable
              style={[styles.deckActionButton, styles.copyButton]}
              onPress={() => setPickerMode('copy')}
            >
              <Text style={styles.copyButtonText}>Copy to another deck</Text>
            </Pressable>
            <Pressable
              style={[styles.deckActionButton, styles.moveButton]}
              onPress={() => setPickerMode('move')}
            >
              <Text style={styles.moveButtonText}>Move to another deck</Text>
            </Pressable>
          </View>
        )}

        {existing && (
          <Pressable style={styles.deleteButton} onPress={remove}>
            <Text style={styles.deleteButtonText}>Delete card</Text>
          </Pressable>
        )}
      </ScrollView>

      <DeckPickerModal
        visible={pickerMode !== null}
        title={pickerMode === 'copy' ? 'Copy to which deck?' : 'Move to which deck?'}
        decks={otherDecks}
        onSelect={pickTargetDeck}
        onCancel={() => setPickerMode(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: colors.border },
  saveButtonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  deckActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  deckActionButton: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  copyButton: { borderColor: colors.primary },
  copyButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  moveButton: { borderColor: colors.textMuted },
  moveButtonText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  deleteButton: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  deleteButtonText: { color: colors.danger, fontWeight: '600' },
});
