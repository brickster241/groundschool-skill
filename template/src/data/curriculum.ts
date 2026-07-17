import type {
  ChecklistItem,
  Lesson,
  Phase,
  Track,
  TrackDraft,
  WeekPlan,
} from './types'
import { t00 } from './tracks/t00'
import { plannerDrafts } from './planner'

/**
 * Phases group tracks into arcs. 4–6 phases reads well; each gets an
 * identifying hue used on rings, headers, and the system map.
 * EXAMPLE — replace names/blurbs/colors and the track imports above.
 */
export const phases: Phase[] = [
  { id: 'bedrock', name: 'Bedrock', blurb: 'What everything else stands on.', color: '#ffb454' },
]

/** Assign stable position-derived ids. Content edits must APPEND, not reorder. */
function assemble(draft: TrackDraft): Track {
  const lessons: Lesson[] = draft.lessons.map((l, li) => ({
    ...l,
    id: `${draft.id}.${li}`,
    items: l.items.map(
      (it, ii): ChecklistItem => ({ ...it, id: `${draft.id}.${li}.${ii}` }),
    ),
  }))
  return { ...draft, lessons }
}

export const tracks: Track[] = [t00].map(assemble)

export const weeks: WeekPlan[] = plannerDrafts.map((w) => ({
  ...w,
  items: w.items.map((it, ii) => ({ ...it, id: `wk${w.week}.${ii}` })),
}))

export const trackBySlug = new Map(tracks.map((t) => [t.slug, t]))
export const trackById = new Map(tracks.map((t) => [t.id, t]))
export const phaseById = new Map(phases.map((p) => [p.id, p]))

export const tracksByPhase = (phaseId: string) =>
  tracks.filter((t) => t.phase === phaseId)

export const allItems: ChecklistItem[] = tracks.flatMap((t) =>
  t.lessons.flatMap((l) => l.items),
)
export const allWeekItems: ChecklistItem[] = weeks.flatMap((w) => w.items)

export const trackItemIds = new Map(
  tracks.map((t) => [t.id, t.lessons.flatMap((l) => l.items.map((i) => i.id))]),
)

export const totalHours = tracks.reduce(
  (acc, t) => [acc[0] + t.hours[0], acc[1] + t.hours[1]] as [number, number],
  [0, 0] as [number, number],
)

export const totalLessons = tracks.reduce((n, t) => n + t.lessons.length, 0)
export const totalItems = allItems.length
