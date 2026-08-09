import type { PipelineStage } from '../../data/types'

/** The spine: how a ground school comes to exist and stays alive. */
export const pipeline: PipelineStage[] = [
  { id: 'analyze', label: 'Analyze', sub: 'repo \u2192 written curriculum plan', file: 'references/analysis.md', trackSlug: 'curriculum-data-model' },
  { id: 'author', label: 'Author', sub: 'plan \u2192 branch bundle, per-field quality bar', file: 'references/curriculum.md', trackSlug: 'curriculum-data-model' },
  { id: 'assemble', label: 'Assemble', sub: 'drafts \u2192 tracks with positional ids', file: 'template/src/curriculum.ts', trackSlug: 'curriculum-data-model' },
  { id: 'render', label: 'Render', sub: 'checklists, decks, diagrams, planner', file: 'template/src/pages/TrackPage.tsx', trackSlug: 'authoring-showcase' },
  { id: 'reach', label: 'Reach out', sub: 'editor bridge + measured embeds', file: 'template/vite-open-in-editor.ts', trackSlug: 'editor-bridge' },
  { id: 'update', label: 'Update', sub: 'shell refresh \u2192 diff \u2192 classify \u2192 append', file: 'references/update.md', trackSlug: 'update-protocol' },
]
