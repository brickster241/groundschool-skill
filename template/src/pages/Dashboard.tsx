import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, MoveRight } from 'lucide-react'
import { useCurriculum, type Curriculum } from '../curriculum'
import { fractionDone, useChecks, useLastTrack } from '../store'
import { CountUp } from '../components/CountUp'
import { PipelineSchematic } from '../components/PipelineSchematic'
import { ProgressRing } from '../components/ProgressRing'
import { inline } from '../components/text'

/** Next incomplete track in curriculum order, or the last visited one if unfinished. */
function upNextFor(c: Curriculum, checks: Record<string, number>, last: string | null) {
  const lastTrack = last ? c.trackBySlug.get(last) : undefined
  if (lastTrack) {
    const frac = fractionDone(c.trackItemIds.get(lastTrack.id) ?? [], checks)
    if (frac < 1) return { track: lastTrack, resumed: true }
  }
  for (const t of c.tracks) {
    const frac = fractionDone(c.trackItemIds.get(t.id) ?? [], checks)
    if (frac < 1) return { track: t, resumed: false }
  }
  // Empty curriculum: there is no 'up next'. Every other page already
  // degrades to an empty state; the landing page was the one that threw.
  const lastOfAll = c.tracks[c.tracks.length - 1]
  return lastOfAll ? { track: lastOfAll, resumed: false } : null
}

export function Dashboard() {
  const c = useCurriculum()
  const checks = useChecks()
  const last = useLastTrack()
  // Count only ids this figure is measured against. The planner writes its
  // own checklist ids into the same map, so counting every key let planner
  // progress inflate track completion past 100%.
  const trackIds = [...c.trackItemIds.values()].flat()
  const done = trackIds.filter((id) => checks[id]).length
  const frac = c.totalItems === 0 ? 0 : Math.min(1, done / c.totalItems)
  const upNext = upNextFor(c, checks, last)
  const hasPipeline = c.pipeline.length > 0

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12" key={c.branch}>
      {/* hero */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="placard">{c.meta.eyebrow}</p>
        {/* meta.title drives the hero (its doc comment always promised so);
            first word plain, the rest carries the accent underline. */}
        <h1 className="mt-2 font-display text-4xl leading-none font-bold tracking-tight text-ink uppercase md:text-5xl">
          {c.meta.title.split(' ')[0]}{' '}
          <span className="border-b-3 border-amber pb-0.5">
            {c.meta.title.split(' ').slice(1).join(' ') || 'GROUND SCHOOL'}
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">{inline(c.meta.intro)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-wider text-faint">
          <span><CountUp value={c.tracks.length} className="text-ink" /> TRACKS</span>
          <span><CountUp value={c.totalLessons} className="text-ink" /> LESSONS</span>
          <span><CountUp value={c.totalItems} className="text-ink" /> CHECKLIST ITEMS</span>
          <span><b className="text-ink">{c.totalHours[0]}–{c.totalHours[1]}</b> HRS EST</span>
          {c.meta.statusChips.map((chip) => (
            <span key={chip} className="text-ok">{chip}</span>
          ))}
        </div>
      </motion.header>

      {/* status strip */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_auto]"
      >
        {upNext ? (
          <Link
            to={`/track/${upNext.track.slug}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-amber/30 bg-panel px-5 py-4 transition-colors hover:border-amber/60"
          >
            <div>
              <span className="placard text-amber">{upNext.resumed ? 'Resume' : 'Up next'}</span>
              <div className="mt-1 font-display text-lg font-semibold text-ink">
                T{String(upNext.track.num).padStart(2, '0')} — {upNext.track.title}
              </div>
              <p className="mt-0.5 max-w-xl text-xs text-dim">{upNext.track.tagline}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-amber transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="rounded-xl border border-line bg-panel px-5 py-4">
            <span className="placard text-faint">No tracks yet</span>
            <p className="mt-1 max-w-xl text-xs text-dim">
              This branch has no curriculum authored yet. Add a track to{' '}
              <code className="font-mono text-[11px] text-hud">src/branches/</code> and it will
              appear here.
            </p>
          </div>
        )}
        <div className="flex items-center gap-4 rounded-xl border border-line bg-panel px-5 py-4">
          <ProgressRing fraction={frac} size={64} stroke={5} />
          <div className="font-mono text-[11px] leading-relaxed tracking-wider text-dim">
            <div><b className="text-ink">{done}</b> / {c.totalItems} DONE</div>
            <div className="text-faint">BRANCH {c.branch.toUpperCase()}</div>
          </div>
        </div>
      </motion.section>

      {/* system map + phases */}
      <section className={`mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-6 ${hasPipeline ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]' : ''}`}>
        {hasPipeline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
          >
            <PipelineSchematic />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.5 }}
          className="space-y-3"
        >
          <div className="placard">Phases</div>
          {c.phases.map((phase) => {
            const pts = c.tracks.filter((t) => t.phase === phase.id)
            const ids = pts.flatMap((t) => c.trackItemIds.get(t.id) ?? [])
            const pfrac = fractionDone(ids, checks)
            return (
              <Link
                key={phase.id}
                to="/tracks"
                className="flex items-center gap-4 rounded-xl border border-line bg-panel px-4 py-3 transition-colors hover:bg-panel2"
              >
                <ProgressRing fraction={pfrac} size={44} stroke={3.5} color={phase.color} />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold text-ink">{phase.name}</div>
                  <p className="line-clamp-2 text-xs leading-snug text-dim">{phase.blurb}</p>
                </div>
                <span className="font-mono text-[10px] text-faint">
                  {pts.map((t) => `T${String(t.num).padStart(2, '0')}`).join(' ')}
                </span>
              </Link>
            )
          })}
          {c.weeks.length > 0 && (
            <Link
              to="/planner"
              className="flex items-center justify-between rounded-xl border border-dashed border-line px-4 py-3 text-sm text-dim transition-colors hover:border-hud/50 hover:text-ink"
            >
              Prefer a schedule? The {c.weeks.length}-week plan
              <MoveRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>
      </section>

      <footer className="mt-12 border-t border-line pt-4 text-center font-mono text-[10px] tracking-wider text-faint">
        {c.meta.motto}
      </footer>
    </div>
  )
}
