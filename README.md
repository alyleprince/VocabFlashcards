# Vocab Flashcards

A mobile app (iOS + Android) for memorizing vocabulary, built with Expo
(React Native + TypeScript).

## Features

- **Decks** — organize vocabulary by language or topic.
- **Custom flashcards** — add any word plus your own translation and notes
  (example sentence, gender, pronunciation, or notes in any language).
- **Study sessions** — tap a card to reveal the other side, then mark it
  right (green) or wrong (red). Two directions: **see word, guess meaning**
  (default) or **see meaning, guess word** — pick per session from the deck
  screen.
- **Pronunciation** — tap the speaker icon to hear the Spanish term read
  aloud (on-device text-to-speech, like Google Translate). In "see meaning,
  guess word" mode, the speaker only appears once you've revealed the word.
- **Revise wrong answers** — every card marked wrong is tracked, so you can
  run a focused session on just those later, from the deck screen.
- **Multi-select** — long-press a card to select it, then tap more cards to
  add to the selection; a toolbar lets you copy, move, or delete all
  selected cards at once. Copy/move are also available for a single card
  from its edit screen. Handy for curating a separate deck to share with
  someone else.
- **Backup & transfer** — export your whole vocabulary, or just one deck, to
  a file, then import it on another phone (or send it to someone else) to
  bring vocabulary across without an account. No backend, no cloud — just a
  file you control.
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

## Switching phones, and sharing a deck (backup & transfer)

- **Export everything**: tap **Backup** on the deck list, then **Export
  vocabulary** — writes all decks/cards to a
  `vocabflashcards-export-*.json` file and opens the system share sheet.
- **Export one deck**: open a deck and tap **Export** in the header — writes
  just that deck (and its cards) to `vocabflashcards-<deck-name>-*.json`.
  Useful for curating a deck of, say, "words for my partner" via
  copy-to-deck, then periodically exporting just that deck to send them.
- **Import** (on the receiving phone, whether that's your own new phone or
  someone else's): Backup → **Import vocabulary**, pick the file. Its
  decks/cards are merged into the local library — decks matched by name,
  cards by term+translation, so importing the same file twice never
  creates duplicates.

The export file is plain JSON with a `format`/`version` header so the app
can validate it on import.

## How study works

Each card has a `status`: `unseen`, `correct`, or `incorrect`. During a
study session, marking a card **Right** sets it to `correct`, **Wrong**
sets it to `incorrect`. A deck's "Revise wrong answers" button studies only
the cards currently marked `incorrect`.

## Building installable apps (Android & iOS)

This app builds via [EAS Build](https://docs.expo.dev/build/introduction/)
(Expo's cloud build service) — no Android Studio or Xcode required, builds
from any OS including Windows. Build config lives in `eas.json`; app
identifiers (`com.alyleprince.vocabflashcards`) are in `app.json`.

```bash
npm install -g eas-cli
eas login                                    # free Expo account
eas build --platform android --profile preview   # -> installable .apk
eas build --platform ios --profile preview        # -> requires Apple Developer Program
```

- **Android**: the `preview` profile builds a plain `.apk` you can download
  and install directly (enable "install unknown apps" for your browser/file
  manager). No Google account or fee required for this.
- **iOS**: Apple requires a paid **Apple Developer Program** membership
  ($99/year) to run a build on a real iPhone, no matter how it's
  distributed (this is an Apple platform rule, not an EAS limitation).
  Once enrolled, `eas build --platform ios` handles certificates and
  provisioning for you interactively. For distributing to your own/a few
  people's phones without device-UDID hassle, submit to TestFlight instead:
  `eas build --platform ios --profile production && eas submit --platform ios`,
  then add testers in App Store Connect.

The first `eas build` run links the project to your Expo account and adds
an `extra.eas.projectId` to `app.json` — commit that change afterward.
