import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import type { ChecklistItem } from '../data/types'
import { useProgress } from '../store'
import { inline } from './text'

const KIND_STYLE: Record<ChecklistItem['kind'], { label: string; cls: string }> = {
  read: { label: 'READ', cls: 'text-hud/80 border-hud/30' },
  run: { label: 'RUN', cls: 'text-amber border-amber/40' },
  build: { label: 'BUILD', cls: 'text-ok/80 border-ok/30' },
  quiz: { label: 'QUIZ', cls: 'text-[#c4b5fd] border-[#c4b5fd]/30' },
  watch: { label: 'WATCH', cls: 'text-[#f0abfc] border-[#f0abfc]/30' },
  write: { label: 'WRITE', cls: 'text-dim border-line' },
}

export function CheckRow({ item, index }: { item: ChecklistItem; index: string }) {
  const done = useProgress((s) => Boolean(s.checks[item.id]))
  const toggle = useProgress((s) => s.toggle)
  const [open, setOpen] = useState(false)
  const kind = KIND_STYLE[item.kind]

  return (
    <div className={`border-b border-line/60 last:border-b-0 ${done ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3 px-3 py-2.5">
        <button
          onClick={() => toggle(item.id)}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line bg-night transition-colors hover:border-amber/60"
        >
          {done && (
            <motion.svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              initial={{ scale: 1.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <path d="M4 10.5 8.2 15 16 5.5" fill="none" stroke="#ffb454" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </button>
        <span className="mt-0.5 hidden w-16 shrink-0 font-mono text-[10px] tracking-wider text-faint sm:block">
          {index}
        </span>
        <span className={`mt-0.5 w-12 shrink-0 rounded border px-1 text-center font-mono text-[9px] leading-4 tracking-wider ${kind.cls}`}>
          {kind.label}
        </span>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => (item.detail ? setOpen(!open) : toggle(item.id))}
            className={`w-full text-left text-sm leading-snug ${done ? 'text-dim line-through decoration-line' : 'text-ink'}`}
          >
            {inline(item.text)}
            {item.detail && (
              <ChevronDown
                className={`ml-1 inline h-3 w-3 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
              />
            )}
          </button>
          {open && item.detail && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="copy mt-1.5 border-l-2 border-line pl-3 text-[13px] leading-relaxed text-dim"
            >
              {inline(item.detail)}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
