import type { QuizQuestion } from '../../data/types'

/**
 * Checkride questions, keyed by track id — the single authoring location for
 * quizzes (tracks never carry them inline; the assembler attaches them).
 * Living here means quiz edits during UPDATE never touch track files.
 *
 * Quality bar (see the skill's references/curriculum.md): 4–6 questions per
 * track, each distractor a real misconception a partial understanding would
 * pick, each explanation teaching why. A track without an entry simply shows
 * no Checkride.
 */
export const quizzes: Record<string, QuizQuestion[]> = {
  t00: [
    {
      prompt: 'An UPDATE inserts a new lesson BEFORE existing ones. What happens to saved progress?',
      options: [
        'Nothing — ids are stable',
        'Later lessons shift position, so saved ticks silently point at the wrong items',
        'The app detects the mismatch and resets the track',
      ],
      answer: 1,
      explain:
        'Ids are positional. Inserting anywhere but the end renumbers everything after it, and nothing can detect that — the ids still resolve, just to different content. Hence the append-only law.',
    },
    {
      prompt: 'Why does the curriculum use positional ids instead of author-assigned ones?',
      options: [
        'They compress better in localStorage',
        'Authors would have to invent and maintain thousands of names nobody reads',
        'React keys require sequential integers',
      ],
      answer: 1,
      explain:
        'The cost of positional ids is the append-only law; the cost of named ids is a naming tax on every single item, forever. The design picks the constraint that binds rarely over the one that binds always.',
    },
    {
      prompt: 'Where would a learner’s progress go if storeKey changed?',
      options: [
        'It migrates automatically',
        'Nowhere — it still sits under the old key; the app just starts reading an empty new one',
        'localStorage rejects the write',
      ],
      answer: 1,
      explain:
        'The store is keyed by name. Change the name and the old data is orphaned, not deleted — which is also why every instance must pick a unique storeKey.',
    },
  ],
  t04: [
    {
      prompt: 'What does a Checkride question test?',
      options: [
        'Memory of file names from the track',
        'The concept — could you act on it without the notes open?',
        'Whether the learner read every resource link',
      ],
      answer: 1,
      explain:
        'Checkrides test working understanding, not recall. If a question can be answered by grepping, it belongs in a READ item instead.',
    },
    {
      prompt: 'A learner scores 2/4 and retakes the Checkride. What happens to their recorded score?',
      options: [
        'The retake overwrites it, whatever it is',
        'Only the best score is kept',
        'Scores accumulate into an average',
      ],
      answer: 1,
      explain:
        'The store keeps the best score per track (quizBest). Retakes are encouraged — the record only improves.',
    },
  ],
}
