import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVocab } from '../context/VocabProvider';
import { exportVocabData, pickAndParseImportFile } from '../lib/backup';
import { colors, radius, spacing } from '../theme';

export function BackupScreen() {
  const { decks, cards, importVocabData } = useVocab();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportVocabData({ decks, cards });
    } catch (err) {
      Alert.alert('Couldn’t export', err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const incoming = await pickAndParseImportFile();
      if (!incoming) return; // user canceled the picker
      const { decksAdded, cardsAdded } = importVocabData(incoming);
      Alert.alert(
        'Import complete',
        `Added ${decksAdded} deck${decksAdded === 1 ? '' : 's'} and ${cardsAdded} card${
          cardsAdded === 1 ? '' : 's'
        }. Anything already in your library was skipped.`
      );
    } catch (err) {
      Alert.alert('Couldn’t import', err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Move to a new phone</Text>
      <Text style={styles.sectionBody}>
        Export your decks and cards to a file, then import that file on your other device to
        bring everything across. No account needed.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export</Text>
        <Text style={styles.cardBody}>
          Save all {decks.length} deck{decks.length === 1 ? '' : 's'} ({cards.length} card
          {cards.length === 1 ? '' : 's'}) to a file you can send to yourself (email, AirDrop,
          Google Drive, etc).
        </Text>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleExport}
          disabled={exporting || decks.length === 0}
        >
          {exporting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {decks.length === 0 ? 'Nothing to export yet' : 'Export vocabulary'}
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Import</Text>
        <Text style={styles.cardBody}>
          Pick a Vocab Flashcards export file to add its decks and cards to this device.
          Existing decks and cards are matched by name, so importing the same file twice
          won&apos;t create duplicates.
        </Text>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={handleImport}
          disabled={importing}
        >
          {importing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>Import vocabulary</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1, gap: spacing.lg },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  sectionBody: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardBody: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  button: {
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  secondaryButton: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
