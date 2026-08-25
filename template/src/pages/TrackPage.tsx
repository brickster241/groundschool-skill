import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  BookOpen,
  Check,
  CheckCheck,
  Copy as CopyIcon,
  FileCode2,
  FlaskConical,
  SquareArrowOutUpRight,
  Telescope,
  TerminalSquare,
} from 'lucide-react'
import { useCurriculum } from '../curriculum'
import type { CodeAnchor, Meta } from '../data/types'
import { absolutePath, openTarget, requestOpen } from '../lib/editorLink'
import { copyText, isLocalOrigin } from '../lib/clipboard'
import { courseSequence, stopHref } from '../lib/course'
import { fractionDone, useChecks, useProgress } from '../store'
import { ArticleReader } from '../components/ArticleReader'
import { Checkride } from '../components/Checkride'
import { CheckRow } from '../components/CheckRow'
import { DiagramPanel } from '../components/DiagramPanel'
import { WidgetPanel } from '../components/WidgetPanel'
import { FlashDeck } from '../components/FlashDeck'
import { NotesEditor } from '../components/NotesEditor'
import { ProgressRing } from '../components/ProgressRing'
import { ResourceRow } from '../components/ResourceRow'
import { VideoEmbed } from '../components/VideoEmbed'
import { Copy, inline } from '../components/text'

/**
 * Copy-to-clipboard button that reports the truth.
 *
 * It must never show a tick it did not earn: off a non-secure origin (reading
 * this on a phone over the LAN) the clipboard API is absent, and a button that
 * flashes green while copying nothing is how you paste the wrong thing into a
 * terminal. On failure it reveals the text instead, selectable.
 */
function CopyBit({
  value,
  title,
  icon,
}: {
  value: string
  title: string
  icon: React.ReactNode
}) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  useEffect(() => {
    if (state === 'idle') return
    const t = setTimeout(() => setState('idle'), state === 'fail' ? 6000 : 1200)
    return () => clearTimeout(t)
  }, [state])

  return (
    <>
      <button
        onClick={() => {
          copyText(value).then((ok) => setState(ok ? 'ok' : 'fail'))
        }}
        title={title}
        aria-label={title}
        className="shrink-0 text-faint transition-colors hover:text-ink"
      >
        {state === 'ok' ? <Check className="h-3 w-3 text-ok" /> : icon}
      </button>
      {state === 'fail' && (
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          ref={(el) => el?.select()}
          aria-label={`${title} — copy manually`}
          className="mt-1 w-full rounded border border-warn/40 bg-panel2 px-1.5 py-1 font-mono text-[10px] text-ink"
        />
      )}
    </>
  )
}

/**
 * One code anchor, with three ways to reach the file, ordered by how reliable
 * they actually are rather than how pretty they look.
 *
 * Clicking asks the dev server to run the editor CLI — see `requestOpen`.
 * A `vscode://` protocol URL is the fallback for a statically served copy,
 * and it is genuinely a fallback: the browser will not tell us whether it
 * fired, because an unregistered handler, a remembered "no" and a blocked
 * navigation all look identical to a click that did nothing. The shell
 * command sits beside them as the escape hatch that always works, and the
 * plain path is there for everything else.
 */
function AnchorRow({ meta, anchor }: { meta: Meta; anchor: CodeAnchor }) {
  const target = openTarget(meta.editor, meta.repoPathAbs, anchor.path, anchor.line)
  const abs = target?.abs ?? absolutePath(meta.repoPathAbs, anchor.path)
  const shown = `${anchor.path}${anchor.line ? `:${anchor.line}` : ''}`
  const [problem, setProblem] = useState<string | null>(null)

  /*
   * Ask the dev server first; only fall through to the protocol URL if there
   * is no server to ask. The server route runs on the machine holding the
   * repo and reports what happened; the protocol URL is dispatched by the
   * browser, needs a permission prompt localhost is not allowed to remember,
   * and fails silently. Preferring the loud, reliable one is the whole point.
   */
  const open = (e: React.MouseEvent) => {
    if (!meta.editor) return
    e.preventDefault()
    setProblem(null)
    requestOpen(meta.editor, abs, anchor.line).then((r) => {
      if (r.kind === 'opened') return
      if (r.kind === 'no-route') {
        // Statically served copy — let the browser try the protocol handler.
        if (target?.href) window.location.href = target.href
        else setProblem('No dev server is running to open the editor.')
        return
      }
      setProblem(r.reason)
    })
  }

  return (
    <li className="flex items-start gap-2 py-1.5">
      <FileCode2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hud/70" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {meta.editor ? (
            <a
              href={target?.href ?? '#'}
              onClick={open}
              title={`Open in ${target?.editorName ?? 'your editor'}`}
              className="flex min-w-0 items-center gap-1 font-mono text-[11px] break-all text-hud hover:underline"
            >
              <span className="min-w-0">{shown}</span>
              <SquareArrowOutUpRight className="h-3 w-3 shrink-0 text-faint" />
            </a>
          ) : (
            <span className="min-w-0 font-mono text-[11px] break-all text-hud">{shown}</span>
          )}
          <CopyBit
            value={abs}
            title="Copy absolute path"
            icon={<CopyIcon className="h-3 w-3" />}
          />
          {target && (
            <CopyBit
              value={target.cli}
              title={`Copy shell command (${target.cli})`}
              icon={<TerminalSquare className="h-3 w-3" />}
            />
          )}
        </div>
        {problem && (
          <p className="mt-1 text-[11px] leading-snug text-warn">
            {problem} Copy the command instead.
          </p>
        )}
        <p className="text-[11px] leading-snug text-dim">{anchor.note}</p>
      </div>
    </li>
  )
}

/**
 * Shown only when the page is being read from another device.
 *
 * `vscode://` is resolved by whichever machine has the browser open, so on a
 * phone the link either does nothing or offers to install an editor there.
 * The same origin also lacks a secure context, which is where `copyText`'s
 * fallback earns its keep. Say so once, quietly, instead of letting three
 * controls fail without explanation.
 */
function RemoteNotice() {
  if (isLocalOrigin()) return null
  return (
    <p className="mt-2 border-t border-line/50 pt-2 text-[11px] leading-snug text-faint">
      You are reading this from another device, so editor links would open on{' '}
      <em>this</em> device, not the one holding the repo. Copy the path or command instead.
    </p>
  )
}

/**
 * Course-mode footer under each lesson: previous · complete & continue · next.
 *
 * The dashboard is a map, but course-grinders want a rail — the Udemy verbs.
 * This lives per lesson so it works whether you arrived by scrolling or by
 * deep-link, and "complete & continue" both ticks every item and carries you
 * to the next lesson (across track boundaries), scrolled into view.
 */
function LessonNav({ lessonId, itemIds }: { lessonId: string; itemIds: string[] }) {
  const c = useCurriculum()
  const checks = useChecks()
  const completeAll = useProgress((s) => s.completeAll)
  const nav = useNavigate()

  const seq = courseSequence(c)
  const i = seq.findIndex((s) => s.lessonId === lessonId)
  if (i === -1) return null
  const prev = i > 0 ? seq[i - 1] : undefined
  const next = i < seq.length - 1 ? seq[i + 1] : undefined
  const done = itemIds.length > 0 && itemIds.every((id) => checks[id])

  const go = (href: string) => {
    // Same-page hash jumps do not remount; scroll the target ourselves.
    nav(href)
    const id = href.split('#')[1]
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2.5">
      <button
        onClick={() => prev && go(stopHref(prev))}
        disabled={!prev}
        className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-dim transition-colors hover:text-ink disabled:opacity-30"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Prev
      </button>
      <button
        onClick={() => {
          completeAll(itemIds)
          if (next) go(stopHref(next))
        }}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] transition-colors ${
          done
            ? 'border border-ok/40 text-ok'
            : 'bg-amber text-night hover:opacity-90'
        }`}
      >
        <CheckCheck className="h-3.5 w-3.5" />
        {done ? (next ? 'Done — continue' : 'Done') : next ? 'Complete & continue' : 'Complete lesson'}
      </button>
      <button
        onClick={() => next && go(stopHref(next))}
        disabled={!next}
        className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-dim transition-colors hover:text-ink disabled:opacity-30"
      >
        Next <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
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

  // A curriculum can name a phase that isn't in the phases array. That is
  // bad data, but it should be visible as bad data — not a white screen.
  const phase = c.phaseById.get(track.phase) ?? {
    id: track.phase,
    name: 'Unassigned',
    blurb: '',
    color: 'var(--color-faint, #7a869a)',
  }
  const ids = c.trackItemIds.get(track.id) ?? []
  const frac = fractionDone(ids, checks)
  const idx = c.tracks.findIndex((t) => t.id === track.id)
  const prev = idx > 0 ? c.tracks[idx - 1] : undefined
  const next = idx < c.tracks.length - 1 ? c.tracks[idx + 1] : undefined

  // Widgets referenced from a chapter render inline there; the rest get the
  // Instruments section so no authored widget can silently vanish.
  const embedded = new Set(
    (track.articles ?? []).flatMap((a) =>
      a.blocks.filter((b) => b.kind === 'widget').map((b) => (b.kind === 'widget' ? b.id : '')),
    ),
  )
  const standaloneWidgets = (track.widgets ?? []).filter((w) => !embedded.has(w.id))

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

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        {/* main column */}
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="placard mb-2 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Mental model
            </h2>
            <Copy text={track.mentalModel} className="text-[14px] leading-relaxed text-ink/90" />
          </section>

          {/* architecture diagrams */}
          {track.diagrams && track.diagrams.length > 0 && (
            <section className="space-y-4">
              {track.diagrams.map((d) => (
                <DiagramPanel key={d.title} d={d} />
              ))}
            </section>
          )}

          <section className="rounded-xl border-l-2 bg-panel px-4 py-3" style={{ borderColor: phase.color }}>
            <h2 className="placard mb-1.5">Why this repo does it this way</h2>
            <Copy text={track.why} className="text-[13px] leading-relaxed text-dim" />
          </section>

          {/* chapters — the long-form textbook layer */}
          {track.articles && track.articles.length > 0 && (
            <section className="space-y-5">
              {track.articles.map((a) => (
                <ArticleReader key={a.id} article={a} widgets={track.widgets} />
              ))}
            </section>
          )}

          {/* instruments not embedded in a chapter */}
          {standaloneWidgets.length > 0 && (
            <section className="space-y-4">
              <h2 className="placard">Instruments — hands on</h2>
              {standaloneWidgets.map((w) => (
                <WidgetPanel key={w.id} spec={w} />
              ))}
            </section>
          )}

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
                        <ResourceRow key={r.label} r={r} />
                      ))}
                    </ul>
                  )}
                  <LessonNav lessonId={lesson.id} itemIds={lids} />
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
            <Checkride key={track.id} trackId={track.id} questions={track.quiz} />
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
              {track.anchors.map((a, i) => (
                <AnchorRow key={`${a.path}:${a.line ?? ''}:${i}`} meta={c.meta} anchor={a} />
              ))}
            </ul>
            <RemoteNotice />
          </div>
          <div className="rounded-xl border border-line bg-panel p-2">
            <h2 className="placard px-2 pt-2 pb-1">Track resources</h2>
            <ul>
              {track.resources.map((r) => (
                <ResourceRow key={r.label} r={r} />
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
