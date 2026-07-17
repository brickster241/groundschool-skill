import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { pipeline } from '../data/pipeline'
import { meta } from '../data/meta'
import { trackBySlug, trackItemIds, phaseById } from '../data/curriculum'
import { fractionDone, useProgress } from '../store'

/**
 * The signature element: the repo's system map as a living schematic.
 * Flow pulses down the spine; each stage is a real file and links into
 * its track. Renders nothing when no pipeline is authored.
 */
export function PipelineSchematic() {
  const checks = useProgress((s) => s.checks)
  if (pipeline.length === 0) return null

  return (
    <div className="relative rounded-xl border border-line bg-panel p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="placard">{meta.systemMapTitle}</span>
        <span className="font-mono text-[10px] text-faint">{meta.systemMapFlow}</span>
      </div>

      <div className="relative">
        {/* spine with flowing pulse */}
        <svg className="absolute top-2 bottom-2 left-[9px] w-[2px]" preserveAspectRatio="none" viewBox="0 0 2 100">
          <line x1="1" y1="0" x2="1" y2="100" stroke="#232b38" strokeWidth="2" />
          <line x1="1" y1="0" x2="1" y2="100" stroke="#ffb454" strokeWidth="2" className="flow-line" opacity="0.9" />
        </svg>

        <ol className="space-y-1.5">
          {pipeline.map((stage, i) => {
            const track = trackBySlug.get(stage.trackSlug)
            const ids = track ? (trackItemIds.get(track.id) ?? []) : []
            const frac = fractionDone(ids, checks)
            const color = track ? phaseById.get(track.phase)?.color : '#8b98a9'
            return (
              <motion.li
                key={stage.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.35 }}
                className="relative pl-8"
              >
                <span
                  className="absolute top-3 left-[5px] h-[10px] w-[10px] rounded-full border-2 bg-night"
                  style={{ borderColor: color }}
                />
                <Link
                  to={track ? `/track/${track.slug}` : '#'}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-line hover:bg-panel2"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-sm font-semibold text-ink">{stage.label}</span>
                      <span className="hidden truncate font-mono text-[10px] text-faint md:inline">{stage.file}</span>
                    </div>
                    <p className="truncate text-xs text-dim">{stage.sub}</p>
                  </div>
                  {ids.length > 0 && (
                    <span
                      className="shrink-0 font-mono text-[10px] tabular-nums"
                      style={{ color: frac > 0 ? color : '#5b6675' }}
                    >
                      {Math.round(frac * 100)}%
                    </span>
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
