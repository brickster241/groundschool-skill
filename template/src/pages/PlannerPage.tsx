import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarRange } from 'lucide-react'
import { useCurriculum } from '../curriculum'
import { fractionDone, useChecks } from '../store'
import { CheckRow } from '../components/CheckRow'
import { NotesEditor } from '../components/NotesEditor'

export function PlannerPage() {
  const c = useCurriculum()
  const checks = useChecks()
  const allIds = c.weeks.flatMap((w) => w.items.map((i) => i.id))
  const overall = fractionDone(allIds, checks)

  if (c.weeks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <CalendarRange className="mx-auto h-6 w-6 text-faint" />
        <p className="mt-3 text-sm text-dim">No study plan authored for this branch.</p>
        <Link
          to="/tracks"
          className="mt-4 inline-block rounded-md border border-amber/40 px-3 py-1.5 font-mono text-[11px] tracking-wider text-amber transition-colors hover:bg-amber/10"
        >
          WORK THE TRACKS DIRECTLY
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-12" key={c.branch}>
      <p className="placard">A spine, not a cage</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        The {c.weeks.length}-week pass
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-dim">
        Reverse-engineer the system: run it, read the file behind what you saw, prove it by
        changing one thing. Adjust freely — order matters more than pace.
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-amber"
          initial={{ width: 0 }}
          animate={{ width: `${overall * 100}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        />
      </div>

      <ol className="mt-8 space-y-6">
        {c.weeks.map((week, wi) => {
          const ids = week.items.map((i) => i.id)
          const done = ids.filter((id) => checks[id]).length
          return (
            <motion.li
              key={week.week}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wi * 0.04, duration: 0.35 }}
              className="overflow-hidden rounded-xl border border-line bg-panel"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-amber">
                    WEEK {String(week.week).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-[15px] font-semibold text-ink">{week.focus}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex gap-1">
                    {week.trackIds.map((tid) => {
                      const t = c.trackById.get(tid)
                      return t ? (
                        <Link
                          key={tid}
                          to={`/track/${t.slug}`}
                          className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-hud transition-colors hover:border-hud/50"
                        >
                          T{String(t.num).padStart(2, '0')}
                        </Link>
                      ) : null
                    })}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums" style={{ color: done === ids.length ? '#4ade80' : '#8b98a9' }}>
                    {done}/{ids.length}
                  </span>
                </div>
              </div>
              <div>
                {week.items.map((item, ii) => (
                  <CheckRow
                    key={item.id}
                    item={item}
                    index={`W${String(week.week).padStart(2, '0')}·${String(ii + 1).padStart(2, '0')}`}
                  />
                ))}
              </div>
            </motion.li>
          )
        })}
      </ol>

      <div className="mt-8">
        <NotesEditor
          noteKey="planner"
          placeholder="Weekly journal — what actually happened vs the plan, and what you'd tell last-week-you…"
        />
      </div>
    </div>
  )
}
