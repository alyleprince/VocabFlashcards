# Vocab Flashcards

A mobile app for memorizing vocabulary using spaced repetition, built with
Expo (React Native + TypeScript).

## Features

- **Decks** — organize vocabulary by language or topic.
- **Flashcards** — add term/translation pairs with optional notes (example
  sentences, gender, pronunciation, etc).
- **Spaced repetition** — reviews are scheduled with the SM-2 algorithm (the
  same one used by Anki): cards you find easy are shown less often, cards you
  struggle with come back sooner.
- **Study sessions** — flip cards, then rate your recall (Again / Hard / Good
  / Easy) to reschedule the next review.
- **Offline-first** — all data is stored locally on-device with
  `AsyncStorage`; no account or network connection required.

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
  types.ts                  # Deck / Card / Rating types
  theme.ts                  # colors, spacing, radius tokens
  lib/
    srs.ts                  # SM-2 spaced repetition scheduling
    storage.ts               # AsyncStorage persistence
    id.ts                    # id generation
  context/
    VocabProvider.tsx        # app state (decks/cards) + CRUD + persistence
  navigation/
    types.ts                 # React Navigation param types
  components/
    Flashcard.tsx             # flip-animation card
  screens/
    DecksScreen.tsx           # deck list
    DeckDetailScreen.tsx      # cards in a deck
    AddEditCardScreen.tsx     # add/edit a card
    StudyScreen.tsx           # review session
```

## How the scheduling works

Each card tracks `interval` (days), `repetitions`, `easeFactor`, and
`dueDate`. When you rate a card during study, `src/lib/srs.ts` recomputes
those fields with the SM-2 algorithm:

- **Again** resets the card to be reviewed tomorrow.
- **Hard / Good / Easy** grow the interval (1 day → 6 days → interval ×
  ease factor), with the ease factor nudged up or down based on how easy the
  recall was.

A deck's "Study" button is only enabled when it has at least one due card.
