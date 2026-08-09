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
  const listRef = useRef<HTMLUListElement>(null)

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
    if (!open) return
    setQ('')
    setSel(0)
    const t = setTimeout(() => inputRef.current?.focus(), 30)

    // Whatever had focus gets it back on close — usually the ⌘K trigger in the
    // sidebar. Without this, focus lands on <body> and the next Tab restarts
    // from the top of the page.
    const restoreTo = document.activeElement as HTMLElement | null
    // The list scrolls; the page behind it should not.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      restoreTo?.focus?.()
    }
  }, [open])

  useEffect(() => setSel(0), [q])

  // Keyboard selection has to drag the viewport with it, or arrowing past the
  // fifth hit moves an invisible highlight.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${sel}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [sel])

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
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        >
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search tracks, lessons and glossary"
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
                role="combobox"
                aria-expanded
                aria-controls="palette-hits"
                aria-activedescendant={hits[sel] ? `palette-hit-${sel}` : undefined}
                autoComplete="off"
                placeholder="Search tracks, lessons, glossary…"
                className="w-full bg-transparent py-3 text-sm text-ink placeholder:text-faint focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-faint">esc</kbd>
            </div>
            <ul id="palette-hits" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
              {hits.map((h, i) => (
                // Lesson titles repeat across tracks ("Setup", "Wiring it up"),
                // so the destination is what actually makes a hit unique.
                <li key={`${h.kind}:${h.to}:${h.title}`}>
                  <button
                    id={`palette-hit-${i}`}
                    data-idx={i}
                    role="option"
                    aria-selected={i === sel}
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
