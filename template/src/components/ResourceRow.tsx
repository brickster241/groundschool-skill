import { useState } from 'react'
import { ChevronDown, ExternalLink, Play, FileText } from 'lucide-react'
import type { Resource } from '../data/types'
import { embedTarget } from '../lib/resourceEmbed'

/**
 * A resource that can be read *here* when the host allows it, and opened out
 * when it doesn't.
 *
 * Two deliberate behaviours:
 *  - **Click to load.** Nothing is fetched from a third party until the learner
 *    asks, so opening a track page makes no request to YouTube or arXiv.
 *  - **No fake previews.** Sites that refuse framing get a plain external link
 *    rather than an iframe that renders as a blank box (see `resourceEmbed`).
 */
export function ResourceRow({ r }: { r: Resource }) {
  const [open, setOpen] = useState(false)
  const embed = embedTarget(r.url, r.embed)

  const badge = (
    <span className="shrink-0 rounded border border-line px-1 font-mono text-[9px] tracking-wider text-faint uppercase">
      {r.kind}
    </span>
  )

  return (
    <li>
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-panel2">
        {badge}

        {/* The label opens the preview when we have one, otherwise it is the external link. */}
        {embed ? (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          >
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{r.label}</span>
            <span className="flex shrink-0 items-center gap-1 font-mono text-[9px] tracking-wider text-faint">
              {embed.kind === 'youtube' ? (
                <Play className="h-2.5 w-2.5" />
              ) : (
                <FileText className="h-2.5 w-2.5" />
              )}
              {embed.hint}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </span>
          </button>
        ) : r.url ? (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 flex-1 items-center gap-1.5"
          >
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{r.label}</span>
            <ExternalLink className="h-3 w-3 shrink-0 text-faint" />
          </a>
        ) : (
          <span className="min-w-0 flex-1 text-[13px] text-ink">{r.label}</span>
        )}

        {/* Always offer the way out — an embed is a convenience, never a cage. */}
        {embed && r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            title="Open in a new tab"
            aria-label={`Open ${r.label} in a new tab`}
            className="shrink-0 text-faint transition-colors hover:text-ink"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {r.note && <p className="px-2 pb-1 text-[11px] text-dim">{r.note}</p>}

      {embed && open && (
        <div className="px-2 pb-2">
          <div
            className={`overflow-hidden rounded-lg border border-line ${
              embed.kind === 'youtube' ? 'aspect-video' : 'h-[70vh] min-h-80'
            }`}
          >
            <iframe
              src={embed.src}
              title={r.label}
              className="h-full w-full bg-panel2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="pt-1 font-mono text-[9px] tracking-wider text-faint">
            Embedded from the source. If it stays blank, the site refused framing — use the
            open-in-tab arrow.
          </p>
        </div>
      )}
    </li>
  )
}
