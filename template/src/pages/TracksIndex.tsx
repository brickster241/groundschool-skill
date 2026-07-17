import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Clock } from 'lucide-react'
import { phases, tracksByPhase, trackItemIds } from '../data/curriculum'
import { fractionDone, useProgress } from '../store'
import { ProgressRing } from '../components/ProgressRing'

function Difficulty({ level, color }: { level: number; color: string }) {
  return (
    <span className="flex gap-0.5" title={`Difficulty ${level}/5`} aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-2.5 w-1 rounded-sm"
          style={{ background: i <= level ? color : '#232b38' }}
        />
      ))}
    </span>
  )
}

export function TracksIndex() {
  const checks = useProgress((s) => s.checks)

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
      <p className="placard">Curriculum</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">All tracks</h1>
      <p className="mt-2 max-w-2xl text-sm text-dim">
        In dependency order. Tracks 00–01 are the true bedrock; if you only do four, do 00, 01, 02, and 04.
      </p>

      <div className="mt-8 space-y-10">
        {phases.map((phase, pi) => (
          <motion.section
            key={phase.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pi * 0.05, duration: 0.4 }}
          >
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="font-display text-lg font-semibold" style={{ color: phase.color }}>
                {phase.name}
              </h2>
              <span className="text-xs text-faint">{phase.blurb}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {tracksByPhase(phase.id).map((t) => {
                const ids = trackItemIds.get(t.id) ?? []
                const frac = fractionDone(ids, checks)
                return (
                  <Link
                    key={t.id}
                    to={`/track/${t.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-line bg-panel p-4 transition-colors hover:border-line hover:bg-panel2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] tracking-wider text-faint">
                          T{String(t.num).padStart(2, '0')}
                          {t.dependsOn.length > 0 && (
                            <span className="ml-2 text-faint/70">
                              after {t.dependsOn.map((d) => d.replace('t', 'T')).join(' ')}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 font-display text-base leading-tight font-semibold text-ink">
                          {t.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-dim">{t.tagline}</p>
                      </div>
                      <ProgressRing fraction={frac} size={42} stroke={3.5} color={phase.color} />
                    </div>
                    <div className="mt-3 flex items-center gap-4 font-mono text-[10px] text-faint">
                      <Difficulty level={t.difficulty} color={phase.color} />
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t.hours[0]}–{t.hours[1]}h
                      </span>
                      <span>{t.lessons.length} lessons</span>
                      <span>{ids.length} items</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  )
}
