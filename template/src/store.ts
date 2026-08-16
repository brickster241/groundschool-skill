import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultBranch, storeKey } from './branches'

/** Per-branch progress: everything a learner accumulates on one branch. */
interface Slice {
  /** itemId -> completion timestamp (ms) */
  checks: Record<string, number>
  /** noteKey (trackId or 'planner') -> markdown */
  notes: Record<string, string>
  /** trackId -> best Checkride score (correct count) */
  quizBest: Record<string, number>
  /** last visited track slug, for the resume card */
  lastTrack: string | null
}

const emptySlice = (): Slice => ({ checks: {}, notes: {}, quizBest: {}, lastTrack: null })

interface ProgressState {
  /** active branch name (a key of the branch registry) */
  branch: string
  slices: Record<string, Slice>
  setBranch: (branch: string) => void
  toggle: (id: string) => void
  /** Mark every id done (idempotent) — the course-mode "complete & continue". */
  completeAll: (ids: string[]) => void
  setNote: (key: string, md: string) => void
  recordQuiz: (trackId: string, score: number) => void
  setLastTrack: (slug: string) => void
  importState: (json: string) => boolean
  resetBranch: () => void
}

/** Immutably update the ACTIVE branch's slice. */
function mutate(s: ProgressState, fn: (slice: Slice) => Partial<Slice>) {
  const cur = s.slices[s.branch] ?? emptySlice()
  return { slices: { ...s.slices, [s.branch]: { ...cur, ...fn(cur) } } }
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      branch: defaultBranch,
      slices: {},
      setBranch: (branch) => set({ branch }),
      toggle: (id) =>
        set((s) =>
          mutate(s, (sl) => {
            const checks = { ...sl.checks }
            if (checks[id]) delete checks[id]
            else checks[id] = Date.now()
            return { checks }
          }),
        ),
      completeAll: (ids) =>
        set((s) =>
          mutate(s, (sl) => {
            const checks = { ...sl.checks }
            const now = Date.now()
            for (const id of ids) if (!checks[id]) checks[id] = now
            return { checks }
          }),
        ),
      setNote: (key, md) =>
        set((s) => mutate(s, (sl) => ({ notes: { ...sl.notes, [key]: md } }))),
      recordQuiz: (trackId, score) =>
        set((s) =>
          mutate(s, (sl) => ({
            quizBest: { ...sl.quizBest, [trackId]: Math.max(sl.quizBest[trackId] ?? 0, score) },
          })),
        ),
      setLastTrack: (slug) => set((s) => mutate(s, () => ({ lastTrack: slug }))),
      importState: (json) => {
        try {
          const data = JSON.parse(json)
          if (typeof data !== 'object' || data === null) return false
          if (typeof data.slices !== 'object' || data.slices === null) return false
          set({ slices: data.slices, branch: data.branch ?? defaultBranch })
          return true
        } catch {
          return false
        }
      },
      resetBranch: () =>
        set((s) => ({ slices: { ...s.slices, [s.branch]: emptySlice() } })),
    }),
    { name: storeKey },
  ),
)

/* Stable empty references so selectors don't churn renders. */
const EMPTY_NUM: Record<string, number> = {}
const EMPTY_STR: Record<string, string> = {}

export const useChecks = () =>
  useProgress((s) => s.slices[s.branch]?.checks ?? EMPTY_NUM)
export const useNotes = () =>
  useProgress((s) => s.slices[s.branch]?.notes ?? EMPTY_STR)
export const useQuizBest = () =>
  useProgress((s) => s.slices[s.branch]?.quizBest ?? EMPTY_NUM)
export const useLastTrack = () =>
  useProgress((s) => s.slices[s.branch]?.lastTrack ?? null)

export function exportState(): string {
  const { branch, slices } = useProgress.getState()
  return JSON.stringify(
    { version: 3, exported: new Date().toISOString(), branch, slices },
    null,
    2,
  )
}

/** fraction complete for a set of item ids */
export function fractionDone(ids: string[], checks: Record<string, number>): number {
  if (ids.length === 0) return 0
  const done = ids.filter((id) => checks[id]).length
  return done / ids.length
}
