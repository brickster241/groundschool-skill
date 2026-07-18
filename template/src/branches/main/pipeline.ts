import type { PipelineStage } from '../../data/types'

/**
 * The system map: the ONE mental model of the repo as an ordered flow,
 * rendered as the dashboard's animated schematic. Every stage names a real
 * file and links into the track that teaches it. 5–9 stages reads best.
 * Leave EMPTY to hide the schematic (phases take the full width).
 * EXAMPLE — replace with the repo's true spine.
 */
export const pipeline: PipelineStage[] = [
  {
    id: 'input',
    label: 'Input',
    sub: 'where the system’s work enters',
    file: 'src/main.ts',
    trackSlug: 'example-track',
  },
  {
    id: 'core',
    label: 'Core',
    sub: 'the transformation that justifies the repo',
    file: 'src/core/',
    trackSlug: 'example-track',
  },
  {
    id: 'output',
    label: 'Output',
    sub: 'what leaves, and who consumes it',
    file: 'src/output/',
    trackSlug: 'example-track',
  },
]
