import type { Flashcard } from '../../data/types'

/**
 * Revision flashcards, keyed by track id — one deck per track, plus the
 * glossary deck the Revision page builds automatically. Front = one prompt
 * (a question, a term, a scenario); back = a crisp answer, three sentences
 * max. Card count scales with how load-bearing the concept is — a bedrock
 * concept deserves a deep deck, a bridging track a shallow one.
 */
export const flashcards: Record<string, Flashcard[]> = {
  t00: [
    {
      front: 'What belongs on the FRONT of a flashcard?',
      back: 'One prompt: a question, a term, or a scenario. If the front needs two sentences, it is two cards.',
    },
    {
      front: 'What belongs on the BACK?',
      back: 'The crisp answer — three sentences max, the thing you want to be able to say from memory.',
    },
    {
      front: 'How many cards should a concept get?',
      back: 'Proportional to how load-bearing it is. Bedrock concepts get deep decks; bridging material gets a few.',
    },
  ],
}
