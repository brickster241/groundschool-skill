import type { BranchBundle, Phase } from '../../data/types'
import { meta } from './meta'
import { t00 } from './tracks/t00'
import { plannerDrafts } from './planner'
import { glossary } from './glossary'
import { pipeline } from './pipeline'
import { quizzes } from './quizzes'
import { flashcards } from './flashcards'
import { diagrams } from './diagrams'

/**
 * Phases group tracks into arcs. 4–6 phases reads well; each gets an
 * identifying hue used on rings, headers, and the system map.
 */
const phases: Phase[] = [
  { id: 'bedrock', name: 'Bedrock', blurb: 'What everything else stands on.', color: '#ffb454' },
]

/** Everything the `main` branch curriculum ships. */
export const bundle: BranchBundle = {
  meta,
  phases,
  tracks: [t00],
  planner: plannerDrafts,
  glossary,
  pipeline,
  quizzes,
  flashcards,
  diagrams,
}
