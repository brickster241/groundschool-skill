import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Search } from 'lucide-react'
import { useCurriculum } from '../curriculum'

interface Hit {
  kind: 'track' | 'lesson' | 'term'
  title: string
  sub: string
  to: string
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const c = useCurriculum()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const index = useMemo<Hit[]>(
    () => [
      ...c.tracks.map((t): Hit => ({
        kind: 'track',
        title: `T${String(t.num).padStart(2, '0')} — ${t.title}`,
        sub: t.tagline,
        to: `/track/${t.slug}`,
      })),
      ...c.tracks.flatMap((t) =>
        t.lessons.map((l): Hit => ({
          kind: 'lesson',
          title: l.title,
          sub: `T${String(t.num).padStart(2, '0')} · ${t.title}`,
          to: `/track/${t.slug}#${l.id}`,
        })),
      ),
      ...c.glossary.map((g): Hit => ({
        kind: 'term',
        title: g.term,
        sub: g.def,
        to: '/glossary',
      })),
    ],
    [c],
  )

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return index.filter((h) => h.kind === 'track')
    return index
      .filter(
        (h) => h.title.toLowerCase().includes(query) || h.sub.toLowerCase().includes(query),
      )
      .slice(0, 12)
  }, [q, index])

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setSel(0), [q])

  const go = (hit: Hit) => {
    onClose()
    nav(hit.to)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="mx-auto mt-[12vh] w-[min(560px,92vw)] overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search className="h-4 w-4 text-faint" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)) }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
                  if (e.key === 'Enter' && hits[sel]) go(hits[sel])
                  if (e.key === 'Escape') onClose()
                }}
                placeholder="Search tracks, lessons, glossary…"
                className="w-full bg-transparent py-3 text-sm text-ink placeholder:text-faint focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-faint">esc</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={`${h.kind}${h.title}`}>
                  <button
                    onClick={() => go(h)}
                    onMouseEnter={() => setSel(i)}
                    className={`flex w-full items-baseline gap-3 px-4 py-2 text-left ${i === sel ? 'bg-panel2' : ''}`}
                  >
                    <span className="w-14 shrink-0 font-mono text-[9px] tracking-wider text-faint uppercase">{h.kind}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink">{h.title}</span>
                      <span className="block truncate text-xs text-dim">{h.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
              {hits.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-faint">No matches. Try a shorter query.</li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
