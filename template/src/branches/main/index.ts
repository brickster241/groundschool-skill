import type { BranchBundle, Phase } from '../../data/types'
import { meta } from './meta'
import { t00 } from './tracks/t00'
import { t01 } from './tracks/t01'
import { t02 } from './tracks/t02'
import { t03 } from './tracks/t03'
import { t04 } from './tracks/t04'
import { plannerDrafts } from './planner'
import { glossary } from './glossary'
import { pipeline } from './pipeline'
import { quizzes } from './quizzes'
import { flashcards } from './flashcards'
import { diagrams } from './diagrams'
import { articles } from './articles'
import { widgets } from './widgets'

/**
 * Phases group tracks into arcs. 4–6 phases reads well; each gets an
 * identifying hue used on rings, headers, and the system map.
 */
const phases: Phase[] = [
  { id: 'bedrock', name: 'Bedrock', blurb: 'The data model and the one law it imposes.', color: '#ffb454' },
  { id: 'shell', name: 'The shell', blurb: 'Where the app meets the browser, and loses politely.', color: '#7dd3fc' },
  { id: 'change', name: 'Change', blurb: 'Following a moving repo without breaking a promise.', color: '#4ade80' },
  { id: 'reference', name: 'Reference', blurb: 'The authoring feature catalogue.', color: '#c4b5fd' },
]

/** Everything the `main` branch curriculum ships. */
export const bundle: BranchBundle = {
  meta,
  phases,
  tracks: [t00, t01, t02, t03, t04],
  planner: plannerDrafts,
  glossary,
  pipeline,
  quizzes,
  flashcards,
  diagrams,
  articles,
  widgets,
}
