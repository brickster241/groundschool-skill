import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { useCurriculum } from '../curriculum'
import type { Flashcard } from '../data/types'
import { FlashDeck } from '../components/FlashDeck'

interface Deck {
  id: string
  label: string
  cards: Flashcard[]
}

/**
 * The revision room: every flash deck in one place — per-track decks, the
 * auto-built glossary deck, and ALL. Decks are shuffled on entry; revision
 * is a workout, not a ledger, so nothing here is persisted.
 */
export function RevisionPage() {
  const c = useCurriculum()

  const decks = useMemo<Deck[]>(() => {
    const trackDecks: Deck[] = c.tracks
      .filter((t) => t.cards && t.cards.length > 0)
      .map((t) => ({
        id: t.id,
        label: `T${String(t.num).padStart(2, '0')} ${t.title}`,
        cards: t.cards!,
      }))
    const glossaryDeck: Deck | null =
      c.glossary.length > 0
        ? {
            id: 'glossary',
            label: 'Glossary',
            cards: c.glossary.map((g) => ({ front: g.term, back: g.def })),
          }
        : null
    const all: Deck = {
      id: 'all',
      label: 'All decks',
      cards: [
        ...trackDecks.flatMap((d) => d.cards),
        ...(glossaryDeck ? glossaryDeck.cards : []),
      ],
    }
    return [all, ...trackDecks, ...(glossaryDeck ? [glossaryDeck] : [])]
  }, [c])

  const [deckId, setDeckId] = useState('all')
  const deck = decks.find((d) => d.id === deckId) ?? decks[0]

  // stable shuffle per deck selection
  const cards = useMemo(() => {
    const a = [...deck.cards]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }, [deck])

  if (decks.length === 0 || decks[0].cards.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <Layers className="mx-auto h-6 w-6 text-faint" />
        <p className="mt-3 text-sm text-dim">No flash decks authored for this branch yet.</p>
        <Link
          to="/tracks"
          className="mt-4 inline-block rounded-md border border-amber/40 px-3 py-1.5 font-mono text-[11px] tracking-wider text-amber transition-colors hover:bg-amber/10"
        >
          BACK TO TRACKS
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:py-12" key={c.branch}>
      <p className="placard">Quick revision · {c.branch}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Flash decks</h1>
      <p className="mt-2 text-sm leading-relaxed text-dim">
        ←/→ to move, space to flip. Shuffled on entry. Say the answer out loud before flipping —
        recall you produce sticks; recognition doesn&rsquo;t.
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {decks.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeckId(d.id)}
            className={`rounded-md border px-2.5 py-1 font-mono text-[10px] tracking-wider transition-colors ${
              d.id === deck.id
                ? 'border-amber/60 bg-amber/10 text-amber'
                : 'border-line text-dim hover:text-ink'
            }`}
          >
            {d.label.toUpperCase()}
            <span className="ml-1.5 text-faint">{d.cards.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <FlashDeck cards={cards} deckLabel={deck.label} />
      </div>
    </div>
  )
}
