import React, { useLayoutEffect, useState } from 'react';
import {
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
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditCard'>;

export function AddEditCardScreen({ route, navigation }: Props) {
  const { deckId, cardId } = route.params;
  const { cards, addCard, updateCard, deleteCard } = useVocab();
  const existing = cardId ? cards.find((c) => c.id === cardId) : undefined;

  const [term, setTerm] = useState(existing?.term ?? '');
  const [translation, setTranslation] = useState(existing?.translation ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit card' : 'New card' });
  }, [navigation, existing]);

  const canSave = term.trim().length > 0 && translation.trim().length > 0;

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

        {existing && (
          <Pressable style={styles.deleteButton} onPress={remove}>
            <Text style={styles.deleteButtonText}>Delete card</Text>
          </Pressable>
        )}
      </ScrollView>
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
  deleteButton: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  deleteButtonText: { color: colors.danger, fontWeight: '600' },
});
