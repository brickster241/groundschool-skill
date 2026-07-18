import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react'
import type { Flashcard } from '../data/types'
import { inline } from './text'

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * The revision deck: 3D flip cards with keyboard flight controls
 * (←/→ navigate, space/enter flips) and a shuffle. Ephemeral by design —
 * revision is a workout, not a ledger.
 */
export function FlashDeck({ cards, deckLabel }: { cards: Flashcard[]; deckLabel: string }) {
  const [order, setOrder] = useState<Flashcard[]>(cards)
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // new deck selected → reset
  useEffect(() => {
    setOrder(cards)
    setI(0)
    setFlipped(false)
  }, [cards])

  const card = order[i]

  const go = useCallback(
    (dir: 1 | -1) => {
      setFlipped(false)
      setI((cur) => Math.min(Math.max(cur + dir, 0), order.length - 1))
    },
    [order.length],
  )

  const reshuffle = () => {
    setOrder(shuffled(cards))
    setI(0)
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ' || e.key === 'Enter') {
        // don't steal Enter/space from focused buttons/links
        if (t.tagName === 'BUTTON' || t.tagName === 'A') return
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const dots = useMemo(() => order.map((_, di) => di), [order])

  if (!card) return null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="placard">{deckLabel}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-wider text-faint tabular-nums">
            {String(i + 1).padStart(2, '0')}/{String(order.length).padStart(2, '0')}
          </span>
          <button
            onClick={reshuffle}
            title="Shuffle deck"
            className="rounded p-1 text-faint transition-colors hover:text-amber"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* the stacked deck */}
      <div className="relative">
        {order.length > i + 2 && (
          <div className="absolute inset-x-3 -bottom-2 h-full rounded-xl border border-line/50 bg-panel/60" />
        )}
        {order.length > i + 1 && (
          <div className="absolute inset-x-1.5 -bottom-1 h-full rounded-xl border border-line/70 bg-panel/80" />
        )}

        <button
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Show front' : 'Reveal answer'}
          className="flip-scene relative block w-full text-left"
        >
          <motion.div
            className="flip-card min-h-44 w-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          >
            <div className="flip-face flex min-h-44 flex-col rounded-xl border border-line bg-panel px-5 py-4">
              <span className="placard text-hud">Prompt</span>
              <span className="flex flex-1 items-center py-3 text-[15px] leading-relaxed text-ink">
                <span>{inline(card.front)}</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-faint">
                TAP OR SPACE TO FLIP
              </span>
            </div>
            <div className="flip-face flip-back absolute inset-0 flex flex-col rounded-xl border border-amber/40 bg-panel px-5 py-4">
              <span className="placard text-amber">Answer</span>
              <span className="flex flex-1 items-center py-3 text-[14px] leading-relaxed text-ink/95">
                <span>{inline(card.back)}</span>
              </span>
            </div>
          </motion.div>
        </button>
      </div>

      {/* controls */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={i === 0}
          aria-label="Previous card"
          className="rounded-md border border-line p-2 text-dim transition-colors hover:text-ink disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex max-w-[60%] flex-wrap items-center justify-center gap-1">
          {dots.map((d) => (
            <span
              key={d}
              className="h-1 rounded-full transition-all"
              style={{
                width: d === i ? 16 : 5,
                background: d === i ? '#ffb454' : d < i ? '#5b6675' : '#232b38',
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          disabled={i === order.length - 1}
          aria-label="Next card"
          className="rounded-md border border-line p-2 text-dim transition-colors hover:text-ink disabled:opacity-30"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
