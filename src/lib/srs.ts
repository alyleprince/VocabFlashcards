import { Card, Rating } from '../types';

// SM-2 spaced repetition algorithm (as used by Anki/SuperMemo), mapped onto
// four simple ratings instead of the original 0-5 quality scale.
const QUALITY: Record<Rating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

const MIN_EASE_FACTOR = 1.3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function createNewCardSchedule(): Pick<
  Card,
  'interval' | 'repetitions' | 'easeFactor' | 'dueDate'
> {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
  };
}

export function scheduleReview(
  card: Card,
  rating: Rating,
  now: Date = new Date()
): Pick<Card, 'interval' | 'repetitions' | 'easeFactor' | 'dueDate' | 'lastReviewed'> {
  const quality = QUALITY[rating];
  let { repetitions, easeFactor } = card;
  let interval: number;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(card.interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const dueDate = new Date(now.getTime() + interval * DAY_MS);

  return {
    interval,
    repetitions,
    easeFactor,
    dueDate: dueDate.toISOString(),
    lastReviewed: now.toISOString(),
  };
}

export function isDue(card: Card, now: Date = new Date()): boolean {
  return new Date(card.dueDate).getTime() <= now.getTime();
}
