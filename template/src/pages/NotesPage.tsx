import { Link } from 'react-router-dom'
import { NotebookPen } from 'lucide-react'
import { tracks } from '../data/curriculum'
import { useProgress } from '../store'
import { NotesEditor } from '../components/NotesEditor'

export function NotesPage() {
  const notes = useProgress((s) => s.notes)
  const withNotes = tracks.filter((t) => (notes[t.id] ?? '').trim().length > 0)
  const plannerNote = (notes['planner'] ?? '').trim().length > 0

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-12">
      <p className="placard">Everything you wrote</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Field notes</h1>
      <p className="mt-2 text-sm text-dim">
        One notebook per track, all local, all markdown. Empty ones are hidden — write in a track page
        or the planner and it appears here.
      </p>

      {withNotes.length === 0 && !plannerNote ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-14 text-center">
          <NotebookPen className="h-6 w-6 text-faint" />
          <p className="text-sm text-dim">No notes yet.</p>
          <p className="max-w-sm text-xs leading-relaxed text-faint">
            The fastest way to find your blind spots: before reading any file, write one sentence
            predicting what it does — then check.
          </p>
          <Link
            to="/tracks"
            className="mt-1 rounded-md border border-amber/40 px-3 py-1.5 font-mono text-[11px] tracking-wider text-amber transition-colors hover:bg-amber/10"
          >
            OPEN A TRACK
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {plannerNote && (
            <section>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="font-display text-base font-semibold text-ink">Weekly journal</h2>
                <Link to="/planner" className="font-mono text-[10px] tracking-wider text-hud hover:underline">
                  PLANNER ↗
                </Link>
              </div>
              <NotesEditor noteKey="planner" />
            </section>
          )}
          {withNotes.map((t) => (
            <section key={t.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="font-display text-base font-semibold text-ink">
                  <span className="mr-2 font-mono text-xs text-faint">T{String(t.num).padStart(2, '0')}</span>
                  {t.title}
                </h2>
                <Link
                  to={`/track/${t.slug}`}
                  className="font-mono text-[10px] tracking-wider text-hud hover:underline"
                >
                  TRACK ↗
                </Link>
              </div>
              <NotesEditor noteKey={t.id} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
