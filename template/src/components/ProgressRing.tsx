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
      <span className="absolute font-mono text-[10px] text-dim">
        {label ?? `${pct}%`}
      </span>
    </div>
  )
}
