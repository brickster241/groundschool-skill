import type { Curriculum } from '../curriculum'

/**
 * Course mode: the whole curriculum as ONE ordered sequence of lessons, the
 * way a Udemy course is one ordered sequence of lectures.
 *
 * The dashboard's native shape is a map (tracks you dip into); some learners —
 * and some curricula, like an interview-prep grind — want a rail instead:
 * where am I, what's next, mark this done and move on. This flattens
 * tracks × lessons into that rail without changing how anything is stored.
 */
export interface CourseStop {
  trackSlug: string
  trackNum: number
  lessonId: string
  lessonTitle: string
  /** ids of every checklist item in this lesson — completing them = done */
  itemIds: string[]
  /** 0-based position in the whole course */
  index: number
}

export function courseSequence(c: Curriculum): CourseStop[] {
  const stops: CourseStop[] = []
  for (const t of c.tracks) {
    for (const l of t.lessons) {
      stops.push({
        trackSlug: t.slug,
        trackNum: t.num,
        lessonId: l.id,
        lessonTitle: l.title,
        itemIds: l.items.map((i) => i.id),
        index: stops.length,
      })
    }
  }
  return stops
}

/** The stop the URL hash points at, else the first incomplete stop. */
export function currentStop(
  stops: CourseStop[],
  hash: string,
  checks: Record<string, number>,
): CourseStop | undefined {
  const byHash = hash && stops.find((s) => '#' + s.lessonId === hash)
  if (byHash) return byHash
  return stops.find((s) => s.itemIds.some((id) => !checks[id])) ?? stops.at(-1)
}

export const stopHref = (s: CourseStop) => `/track/${s.trackSlug}#${s.lessonId}`
