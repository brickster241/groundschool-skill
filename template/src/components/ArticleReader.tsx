import React, { useEffect, useState } from 'react'
import { BookOpenText, Info, ShieldCheck, TriangleAlert, Wrench } from 'lucide-react'
import type { Article, ArticleBlock, WidgetSpec } from '../data/types'
import { DiagramPanel } from './DiagramPanel'
import { WidgetPanel } from './WidgetPanel'
import { inline } from './text'

/**
 * The long-form chapter renderer.
 *
 * KaTeX is the heaviest thing the shell can pull in, and most branches never
 * author a single equation — so it loads on demand, once, the first time a
 * math node actually mounts. Until then the TeX source shows in mono, which
 * is also the graceful state if the chunk never arrives (offline reader,
 * blocked request): degraded but honest, never blank.
 */
type KatexModule = typeof import('katex')
let katexPromise: Promise<KatexModule> | null = null
function loadKatex(): Promise<KatexModule> {
  katexPromise ??= Promise.all([
    import('katex'),
    // Vite turns this into a stylesheet injection alongside the JS chunk.
    import('katex/dist/katex.min.css'),
  ]).then(([m]) => (m as unknown as { default?: KatexModule }).default ?? (m as KatexModule))
  return katexPromise
}

/**
 * KaTeX output is generated from build-time TeX authored in the branch — the
 * same trust level as every other curriculum string — and unlike diagram SVGs
 * it is not hand-written markup, so it skips the DOMPurify pass DiagramPanel
 * applies to author-supplied SVG.
 */
function TeX({ tex, display }: { tex: string; display?: boolean }) {
  const [html, setHtml] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    loadKatex().then((k) => {
      if (!live) return
      setHtml(k.renderToString(tex, { displayMode: !!display, throwOnError: false }))
    })
    return () => {
      live = false
    }
  }, [tex, display])

  if (html === null) {
    return display ? (
      <div className="overflow-x-auto py-1 text-center font-mono text-[12px] text-faint">{tex}</div>
    ) : (
      <span className="font-mono text-[0.85em] text-faint">{tex}</span>
    )
  }
  return display ? (
    <div className="katex-block" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Paragraph text: code spans, bold, italic, plus inline $math$. */
function rich(text: string): React.ReactNode[] {
  return text.split(/(\$[^$]+\$)/g).map((seg, i) => {
    if (seg.length > 2 && seg.startsWith('$') && seg.endsWith('$')) {
      return <TeX key={`m${i}`} tex={seg.slice(1, -1)} />
    }
    return <React.Fragment key={`t${i}`}>{inline(seg)}</React.Fragment>
  })
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const TONES = {
  note: { icon: Info, color: 'var(--color-hud)', label: 'NOTE' },
  trap: { icon: TriangleAlert, color: 'var(--color-warn)', label: 'TRAP' },
  street: { icon: Wrench, color: 'var(--color-amber)', label: 'STREET' },
  canon: { icon: ShieldCheck, color: 'var(--color-ok)', label: 'CANON' },
} as const

function Block({
  b,
  widgets,
}: {
  b: ArticleBlock
  widgets: Map<string, WidgetSpec>
}): React.ReactElement {
  switch (b.kind) {
    case 'h2':
      return (
        <h3
          id={slug(b.text)}
          className="scroll-mt-20 border-b border-line pt-4 pb-1.5 font-display text-xl font-bold text-ink"
        >
          {b.text}
        </h3>
      )
    case 'h3':
      return (
        <h4 id={slug(b.text)} className="scroll-mt-20 pt-2 font-display text-[15px] font-semibold text-ink">
          {b.text}
        </h4>
      )
    case 'p':
      return <p className="copy text-[14px] leading-relaxed text-ink/90">{rich(b.text)}</p>
    case 'math':
      return (
        <div className="flex items-center gap-3">
          <div className="katex-scroll min-w-0 flex-1">
            <TeX tex={b.tex} display />
          </div>
          {b.label && (
            <span className="shrink-0 font-mono text-[11px] text-faint">{b.label}</span>
          )}
        </div>
      )
    case 'callout': {
      const t = TONES[b.tone]
      const IconC = t.icon
      return (
        <aside
          className="rounded-lg border-l-2 bg-panel2/60 px-3.5 py-2.5"
          style={{ borderColor: t.color }}
        >
          <div className="flex items-center gap-1.5 pb-1 font-mono text-[10px] tracking-[0.18em]" style={{ color: t.color }}>
            <IconC className="h-3 w-3" /> {t.label} — {b.title.toUpperCase()}
          </div>
          <p className="copy text-[13px] leading-relaxed text-dim">{rich(b.text)}</p>
        </aside>
      )
    }
    case 'figure':
      return <DiagramPanel d={{ title: b.title, caption: b.caption, svg: b.svg }} />
    case 'code':
      return (
        <figure>
          <pre className="overflow-x-auto rounded-lg border border-line bg-[#0d1117] px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3]">
            <code>{b.code}</code>
          </pre>
          {b.caption && <figcaption className="pt-1 text-[12px] text-dim">{b.caption}</figcaption>}
        </figure>
      )
    case 'table':
      return (
        <figure className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {b.head.map((h, i) => (
                  <th
                    key={i}
                    className="border-b border-line px-2.5 py-1.5 text-left font-mono text-[10px] tracking-wider text-dim uppercase"
                  >
                    {rich(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-line/50 px-2.5 py-1.5 align-top leading-relaxed text-ink/90">
                      {rich(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {b.caption && <figcaption className="pt-1.5 text-[12px] text-dim">{b.caption}</figcaption>}
        </figure>
      )
    case 'worked':
      return (
        <section className="rounded-xl border border-line bg-panel2/40 p-4">
          <h5 className="placard mb-2 text-amber">WORKED — {b.title}</h5>
          <ol className="space-y-2.5">
            {b.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="pt-0.5 font-mono text-[11px] text-amber">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  {s.text && (
                    <p className="copy text-[13px] leading-relaxed text-ink/90">{rich(s.text)}</p>
                  )}
                  {s.tex && (
                    <div className="katex-scroll">
                      <TeX tex={s.tex} display />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )
    case 'widget': {
      const spec = widgets.get(b.id)
      if (!spec) {
        // Bad data should be visible as bad data, not a silent hole in the chapter.
        return (
          <p className="rounded-lg border border-warn/40 px-3 py-2 font-mono text-[11px] text-warn">
            Unknown widget id "{b.id}" — check the track's widgets map.
          </p>
        )
      }
      return <WidgetPanel spec={spec} />
    }
  }
}

/** One chapter: placard header, then the block flow. */
export function ArticleReader({
  article,
  widgets,
}: {
  article: Article
  widgets?: WidgetSpec[]
}) {
  const widgetMap = new Map((widgets ?? []).map((w) => [w.id, w]))
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel">
      <header className="border-b border-line px-5 py-3.5">
        <div className="placard flex items-center gap-2">
          <BookOpenText className="h-3.5 w-3.5" /> CHAPTER
        </div>
        <h2 className="pt-1 font-display text-2xl leading-tight font-bold text-ink">
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="pt-1 text-[13px] leading-relaxed text-dim">{article.subtitle}</p>
        )}
      </header>
      <div className="space-y-4 px-5 py-4">
        {article.blocks.map((b, i) => (
          <Block key={i} b={b} widgets={widgetMap} />
        ))}
      </div>
    </article>
  )
}
