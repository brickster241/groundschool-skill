import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  BookOpen,
  Check,
  Copy as CopyIcon,
  ExternalLink,
  FileCode2,
  FlaskConical,
  SquareArrowOutUpRight,
  Telescope,
} from 'lucide-react'
import { useCurriculum } from '../curriculum'
import type { CodeAnchor, Meta, Resource } from '../data/types'
import { fractionDone, useChecks, useProgress } from '../store'
import { Checkride } from '../components/Checkride'
import { CheckRow } from '../components/CheckRow'
import { FlashDeck } from '../components/FlashDeck'
import { NotesEditor } from '../components/NotesEditor'
import { ProgressRing } from '../components/ProgressRing'
import { VideoEmbed } from '../components/VideoEmbed'
import { Copy, inline } from '../components/text'

/** vscode://file/abs/path:line — cursor and zed use the same scheme shape. */
function editorHref(meta: Meta, anchor: CodeAnchor): string | null {
  if (!meta.editor) return null
  const abs = `${meta.repoPathAbs}/${anchor.path}`
  const line = anchor.line ? `:${anchor.line}` : ''
  return `${meta.editor}://file${abs}${line}`
}

function AnchorRow({ meta, anchor }: { meta: Meta; anchor: CodeAnchor }) {
  const [copied, setCopied] = useState(false)
  const href = editorHref(meta, anchor)
  return (
    <li className="flex items-start gap-2 py-1.5">
      <FileCode2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hud/70" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {href ? (
            <a
              href={href}
              title={`Open in ${meta.editor}`}
              className="flex min-w-0 items-center gap-1 font-mono text-[11px] break-all text-hud hover:underline"
            >
              <span className="min-w-0">{anchor.path}{anchor.line ? `:${anchor.line}` : ''}</span>
              <SquareArrowOutUpRight className="h-3 w-3 shrink-0 text-faint" />
            </a>
          ) : (
            <span className="min-w-0 font-mono text-[11px] break-all text-hud">
              {anchor.path}{anchor.line ? `:${anchor.line}` : ''}
            </span>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(`${meta.repoPathAbs}/${anchor.path}`)
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
            title="Copy absolute path"
            aria-label="Copy absolute path"
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-ok" />
            ) : (
              <CopyIcon className="h-3 w-3 text-faint transition-colors hover:text-ink" />
            )}
          </button>
        </div>
        <p className="text-[11px] leading-snug text-dim">{anchor.note}</p>
      </div>
    </li>
  )
}

function ResourceLink({ r }: { r: Resource }) {
  const body = (
    <>
      <span className="rounded border border-line px-1 font-mono text-[9px] tracking-wider text-faint uppercase">
        {r.kind}
      </span>
      <span className="min-w-0 flex-1 text-[13px] text-ink">{r.label}</span>
      {r.url && <ExternalLink className="h-3 w-3 shrink-0 text-faint" />}
    </>
  )
  const cls = 'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-panel2'
  return (
    <li>
      {r.url ? (
        <a href={r.url} target="_blank" rel="noreferrer" className={cls}>
          {body}
        </a>
      ) : (
        <div className={cls}>{body}</div>
      )}
      {r.note && <p className="px-2 pb-1 text-[11px] text-dim">{r.note}</p>}
    </li>
  )
}

function DeprecatedBanner({ note }: { note?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2">
      <Archive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
      <div className="min-w-0">
        <span className="font-mono text-[10px] tracking-wider text-warn">
          DEPRECATED — kept for your progress and notes
        </span>
        {note && <p className="text-[12px] leading-snug text-dim">{note}</p>}
      </div>
    </div>
  )
}

export function TrackPage() {
  const c = useCurriculum()
  const { slug } = useParams()
  const { hash } = useLocation()
  const track = slug ? c.trackBySlug.get(slug) : undefined
  const checks = useChecks()
  const setLastTrack = useProgress((s) => s.setLastTrack)

  useEffect(() => {
    if (track) setLastTrack(track.slug)
  }, [track, setLastTrack])

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash, slug])

  if (!track) return <Navigate to="/tracks" replace />

  const phase = c.phaseById.get(track.phase)!
  const ids = c.trackItemIds.get(track.id) ?? []
  const frac = fractionDone(ids, checks)
  const idx = c.tracks.findIndex((t) => t.id === track.id)
  const prev = idx > 0 ? c.tracks[idx - 1] : undefined
  const next = idx < c.tracks.length - 1 ? c.tracks[idx + 1] : undefined

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-10">
      {/* header */}
      <motion.header
        key={track.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-line pb-6"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider">
          <Link to="/tracks" className="text-faint hover:text-ink">TRACKS</Link>
          <span className="text-faint">/</span>
          <span style={{ color: phase.color }}>{phase.name.toUpperCase()}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight font-bold text-ink">
              <span className="mr-3 font-mono text-xl font-medium text-faint">
                T{String(track.num).padStart(2, '0')}
              </span>
              {track.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">{track.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] tracking-wider text-faint">
              <span>{track.hours[0]}–{track.hours[1]} HRS</span>
              <span>DIFFICULTY {track.difficulty}/5</span>
              <span>{track.lessons.length} LESSONS · {ids.length} ITEMS</span>
              {track.dependsOn.length > 0 && (
                <span>
                  AFTER{' '}
                  {track.dependsOn.map((d, i) => {
                    const dep = c.trackById.get(d)
                    return (
                      <span key={d}>
                        {i > 0 && ' '}
                        {dep ? (
                          <Link to={`/track/${dep.slug}`} className="text-hud hover:underline">
                            {d.replace('t', 'T')}
                          </Link>
                        ) : (
                          d
                        )}
                      </span>
                    )
                  })}
                </span>
              )}
            </div>
            {track.status === 'deprecated' && (
              <div className="mt-3">
                <DeprecatedBanner note={track.statusNote} />
              </div>
            )}
          </div>
          <ProgressRing fraction={frac} size={72} stroke={5} color={phase.color} />
        </div>
      </motion.header>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_290px]">
        {/* main column */}
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="placard mb-2 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Mental model
            </h2>
            <Copy text={track.mentalModel} className="text-[14px] leading-relaxed text-ink/90" />
          </section>

          <section className="rounded-xl border-l-2 bg-panel px-4 py-3" style={{ borderColor: phase.color }}>
            <h2 className="placard mb-1.5">Why this repo does it this way</h2>
            <Copy text={track.why} className="text-[13px] leading-relaxed text-dim" />
          </section>

          {/* lessons */}
          <section className="space-y-5">
            <h2 className="placard">Lessons — challenge / response</h2>
            {track.lessons.map((lesson, li) => {
              const lids = lesson.items.map((i) => i.id)
              const lfrac = fractionDone(lids, checks)
              return (
                <div key={lesson.id} id={lesson.id} className="scroll-mt-20 overflow-hidden rounded-xl border border-line bg-panel">
                  <div className="border-b border-line px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-[15px] font-semibold text-ink">
                        <span className="mr-2 font-mono text-xs font-normal text-faint">
                          L{li + 1}
                        </span>
                        {lesson.title}
                      </h3>
                      <span
                        className="shrink-0 font-mono text-[10px] tabular-nums"
                        style={{ color: lfrac === 1 ? '#4ade80' : lfrac > 0 ? phase.color : '#5b6675' }}
                      >
                        {lids.filter((id) => checks[id]).length}/{lids.length}
                      </span>
                    </div>
                    {lesson.status === 'deprecated' && (
                      <div className="mt-2">
                        <DeprecatedBanner note={lesson.statusNote} />
                      </div>
                    )}
                    <Copy text={lesson.summary} className="mt-2 text-[13px] leading-relaxed text-dim" />
                  </div>
                  <div>
                    {lesson.items.map((item, ii) => (
                      <CheckRow
                        key={item.id}
                        item={item}
                        index={`T${String(track.num).padStart(2, '0')}·L${li + 1}·${String(ii + 1).padStart(2, '0')}`}
                      />
                    ))}
                  </div>
                  {lesson.video && <VideoEmbed video={lesson.video} />}
                  {lesson.resources && lesson.resources.length > 0 && (
                    <ul className="border-t border-line/60 px-2 py-1.5">
                      {lesson.resources.map((r) => (
                        <ResourceLink key={r.label} r={r} />
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </section>

          {/* deep dive */}
          <section className="rounded-xl border border-line bg-panel p-4">
            <h2 className="placard mb-2 flex items-center gap-2">
              <Telescope className="h-3.5 w-3.5" /> Deep dive — {track.deepDive.title}
            </h2>
            <Copy text={track.deepDive.body} className="text-[13px] leading-relaxed text-dim" />
          </section>

          {/* prove it */}
          <section className="rounded-xl border border-amber/25 bg-panel p-4">
            <h2 className="placard mb-2 flex items-center gap-2 text-amber">
              <FlaskConical className="h-3.5 w-3.5" /> Prove it — change one thing
            </h2>
            <ul className="space-y-2">
              {track.proveIt.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/90">
                  <span className="font-mono text-[11px] text-amber">{String(i + 1).padStart(2, '0')}</span>
                  <span>{inline(p)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* flash deck */}
          {track.cards && track.cards.length > 0 && (
            <section>
              <FlashDeck
                cards={track.cards}
                deckLabel={`Flash deck — ${track.cards.length} cards`}
              />
            </section>
          )}

          {/* checkride */}
          {track.quiz && track.quiz.length > 0 && (
            <Checkride trackId={track.id} questions={track.quiz} />
          )}

          {/* notes */}
          <NotesEditor
            noteKey={track.id}
            placeholder={`Notes for ${track.title} — what surprised you, what you'd explain differently, open questions…`}
          />

          {/* prev/next */}
          <nav className="flex items-stretch justify-between gap-3 border-t border-line pt-5">
            {prev ? (
              <Link
                to={`/track/${prev.slug}`}
                className="group flex items-center gap-2 rounded-lg border border-line px-4 py-3 text-sm text-dim transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  <span className="block font-mono text-[9px] text-faint">T{String(prev.num).padStart(2, '0')}</span>
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={`/track/${next.slug}`}
                className="group flex items-center gap-2 rounded-lg border border-line px-4 py-3 text-right text-sm text-dim transition-colors hover:text-ink"
              >
                <span>
                  <span className="block font-mono text-[9px] text-faint">T{String(next.num).padStart(2, '0')}</span>
                  {next.title}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </nav>
        </div>

        {/* meta column */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className="rounded-xl border border-line bg-panel p-4">
            <h2 className="placard mb-2">Code anchors</h2>
            <ul className="divide-y divide-line/50">
              {track.anchors.map((a) => (
                <AnchorRow key={a.path} meta={c.meta} anchor={a} />
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-panel p-2">
            <h2 className="placard px-2 pt-2 pb-1">Track resources</h2>
            <ul>
              {track.resources.map((r) => (
                <ResourceLink key={r.label} r={r} />
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
