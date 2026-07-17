import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { meta } from './data/meta'

interface ProgressState {
  /** itemId -> completion timestamp (ms) */
  checks: Record<string, number>
  /** noteKey (trackId or 'planner') -> markdown */
  notes: Record<string, string>
  /** last visited track slug, for the resume card */
  lastTrack: string | null
  toggle: (id: string) => void
  setNote: (key: string, md: string) => void
  setLastTrack: (slug: string) => void
  importState: (json: string) => boolean
  resetAll: () => void
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      checks: {},
      notes: {},
      lastTrack: null,
      toggle: (id) =>
        set((s) => {
          const checks = { ...s.checks }
          if (checks[id]) delete checks[id]
          else checks[id] = Date.now()
          return { checks }
        }),
      setNote: (key, md) =>
        set((s) => ({ notes: { ...s.notes, [key]: md } })),
      setLastTrack: (slug) => set({ lastTrack: slug }),
      importState: (json) => {
        try {
          const data = JSON.parse(json)
          if (typeof data !== 'object' || data === null) return false
          if (typeof data.checks !== 'object' || typeof data.notes !== 'object')
            return false
          set({
            checks: data.checks ?? {},
            notes: data.notes ?? {},
            lastTrack: data.lastTrack ?? null,
          })
          return true
        } catch {
          return false
        }
      },
      resetAll: () => set({ checks: {}, notes: {}, lastTrack: null }),
    }),
    { name: meta.storageKey },
  ),
)

export function exportState(): string {
  const { checks, notes, lastTrack } = useProgress.getState()
  return JSON.stringify(
    { version: 1, exported: new Date().toISOString(), checks, notes, lastTrack },
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
