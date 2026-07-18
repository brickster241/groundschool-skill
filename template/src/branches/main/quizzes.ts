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
