import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { glossary } from '../data/glossary'
import { trackById } from '../data/curriculum'

export function GlossaryPage() {
  const [q, setQ] = useState('')
  const terms = useMemo(() => {
    const query = q.trim().toLowerCase()
    const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term))
    if (!query) return sorted
    return sorted.filter(
      (t) => t.term.toLowerCase().includes(query) || t.def.toLowerCase().includes(query),
    )
  }, [q])

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-12">
      <p className="placard">Vocabulary</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Glossary</h1>
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-panel px-3">
        <Search className="h-4 w-4 text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${glossary.length} terms…`}
          className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none"
        />
      </div>

      <dl className="mt-6 divide-y divide-line/60">
        {terms.map((t) => {
          const track = t.trackId ? trackById.get(t.trackId) : undefined
          return (
            <div key={t.term} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
              <dt className="w-44 shrink-0 font-mono text-[13px] font-medium text-amber">{t.term}</dt>
              <dd className="flex-1 text-sm leading-relaxed text-ink/90">
                {t.def}
                {track && (
                  <Link
                    to={`/track/${track.slug}`}
                    className="ml-2 font-mono text-[10px] tracking-wider text-hud hover:underline"
                  >
                    T{String(track.num).padStart(2, '0')} ↗
                  </Link>
                )}
              </dd>
            </div>
          )
        })}
        {terms.length === 0 && (
          <p className="py-8 text-center text-sm text-faint">No terms match.</p>
        )}
      </dl>
    </div>
  )
}
