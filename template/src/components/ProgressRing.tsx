import { motion } from 'motion/react'

interface Props {
  fraction: number
  size?: number
  stroke?: number
  color?: string
  label?: string
}

export function ProgressRing({ fraction, size = 56, stroke = 4, color = '#ffb454', label }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.round(fraction * 100)
  // Zero progress is not a statistic — a page of empty "0%" rings is template
  // chrome. Untouched state renders as a quiet accent dot in the same slot.
  if (fraction === 0 && !label) {
    return (
      <div className="inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="rounded-full" style={{ width: 10, height: 10, background: color, opacity: 0.55 }} />
      </div>
    )
  }
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#232b38" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - fraction) }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      {/* A wall of "0%" rings is template chrome, not information — an
          untouched ring keeps its track and stays quiet. */}
      <span className="absolute font-mono text-[10px] text-dim">
        {label ?? `${pct}%`}
      </span>
    </div>
  )
}
