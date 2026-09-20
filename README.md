# Vocab Flashcards

A mobile app (iOS + Android) for memorizing vocabulary, built with Expo
(React Native + TypeScript).

## Features

- **Decks** — organize vocabulary by language or topic.
- **Custom flashcards** — add any word plus your own translation and notes
  (example sentence, gender, pronunciation, or notes in any language).
- **Study sessions** — tap a card to reveal the translation, then mark it
  right (green) or wrong (red).
- **Pronunciation** — tap the speaker icon on either side of a card to hear
  it read aloud (on-device text-to-speech, like Google Translate). Set a
  language code on a deck (e.g. `es-ES`, `fr-FR`) so the term is pronounced
  correctly.
- **Revise wrong answers** — every card marked wrong is tracked, so you can
  run a focused session on just those later, from the deck screen.
- **Backup & transfer** — export your whole vocabulary to a file, then
  import it on another phone to switch devices without an account. No
  backend, no cloud — just a file you control.
- **Offline-first** — all data is stored locally on-device with
  `AsyncStorage`; no account or network connection required to use the app.

## Getting started

```bash
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, `w` for web, or
scan the QR code with the Expo Go app on your phone.

## Project structure

```
App.tsx                     # navigation + providers
src/
  types.ts                  # Deck / Card types
  theme.ts                  # colors, spacing, radius tokens
  lib/
    storage.ts               # AsyncStorage persistence
    backup.ts                 # export/import to a JSON file
    speech.ts                 # text-to-speech playback
    id.ts                    # id generation
  context/
    VocabProvider.tsx        # app state (decks/cards) + CRUD + import merge
  navigation/
    types.ts                 # React Navigation param types
  components/
    Flashcard.tsx             # flip-animation card
  screens/
    DecksScreen.tsx           # deck list
    DeckDetailScreen.tsx      # cards in a deck, study / revise entry points
    AddEditCardScreen.tsx     # add/edit a card
    StudyScreen.tsx           # review session (all cards, or wrong-only)
    BackupScreen.tsx          # export / import vocabulary
```

## Switching phones (backup & transfer)

Tap **Backup** on the deck list, then:

- **Export** writes all your decks/cards to a `vocabflashcards-export-*.json`
  file and opens the system share sheet — send it to yourself however you
  like (email, AirDrop, Google Drive, Files app, etc).
- **Import** (on the new phone) opens the file picker; pick that file and
  its decks/cards are merged into your library. Decks are matched by name
  and cards by term+translation, so importing the same file twice never
  creates duplicates.

The export file is plain JSON with a `format`/`version` header so the app
can validate it on import.

## How study works

Each card has a `status`: `unseen`, `correct`, or `incorrect`. During a
study session, marking a card **Right** sets it to `correct`, **Wrong**
sets it to `incorrect`. A deck's "Revise wrong answers" button studies only
the cards currently marked `incorrect`.
