import type {
  BranchBundle,
  ChecklistItem,
  GlossaryTerm,
  Lesson,
  Meta,
  Phase,
  PipelineStage,
  Track,
  TrackDraft,
  WeekPlan,
} from './data/types'
import { branchBundles, defaultBranch } from './branches'
import { useProgress } from './store'

/** One branch's fully-assembled, indexed curriculum — what every view consumes. */
export interface Curriculum {
  branch: string
  meta: Meta
  phases: Phase[]
  tracks: Track[]
  weeks: WeekPlan[]
  glossary: GlossaryTerm[]
  pipeline: PipelineStage[]
  trackBySlug: Map<string, Track>
  trackById: Map<string, Track>
  phaseById: Map<string, Phase>
  /** trackId -> its checklist item ids */
  trackItemIds: Map<string, string[]>
  totalHours: [number, number]
  totalLessons: number
  totalItems: number
}

/** Assign stable position-derived ids. Content edits must APPEND, not reorder. */
function assembleTrack(draft: TrackDraft, b: BranchBundle): Track {
  const lessons: Lesson[] = draft.lessons.map((l, li) => ({
    ...l,
    id: `${draft.id}.${li}`,
    items: l.items.map(
      (it, ii): ChecklistItem => ({ ...it, id: `${draft.id}.${li}.${ii}` }),
    ),
  }))
  return {
    ...draft,
    lessons,
    quiz: b.quizzes[draft.id],
    cards: b.flashcards[draft.id],
    diagrams: b.diagrams[draft.id],
    articles: b.articles?.[draft.id],
    widgets: b.widgets?.[draft.id],
  }
}

function assemble(branch: string, b: BranchBundle): Curriculum {
  const tracks = b.tracks.map((t) => assembleTrack(t, b))
  const weeks: WeekPlan[] = b.planner.map((w) => ({
    ...w,
    items: w.items.map((it, ii) => ({ ...it, id: `wk${w.week}.${ii}` })),
  }))
  const trackItemIds = new Map(
    tracks.map((t) => [t.id, t.lessons.flatMap((l) => l.items.map((i) => i.id))]),
  )
  return {
    branch,
    meta: b.meta,
    phases: b.phases,
    tracks,
    weeks,
    glossary: b.glossary,
    pipeline: b.pipeline,
    trackBySlug: new Map(tracks.map((t) => [t.slug, t])),
    trackById: new Map(tracks.map((t) => [t.id, t])),
    phaseById: new Map(b.phases.map((p) => [p.id, p])),
    trackItemIds,
    totalHours: tracks.reduce(
      (acc, t) => [acc[0] + t.hours[0], acc[1] + t.hours[1]] as [number, number],
      [0, 0] as [number, number],
    ),
    totalLessons: tracks.reduce((n, t) => n + t.lessons.length, 0),
    totalItems: [...trackItemIds.values()].reduce((n, ids) => n + ids.length, 0),
  }
}

/** All branches, assembled once at module load (content is static). */
export const curricula: Record<string, Curriculum> = Object.fromEntries(
  Object.entries(branchBundles).map(([name, b]) => [name, assemble(name, b)]),
)

export const branchNames = Object.keys(curricula)

/** The active branch's curriculum. The single data hook every view uses. */
export function useCurriculum(): Curriculum {
  const branch = useProgress((s) => s.branch)
  return curricula[branch] ?? curricula[defaultBranch]
}
