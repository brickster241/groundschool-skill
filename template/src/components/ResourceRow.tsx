import { useState } from 'react'
import { ChevronDown, ExternalLink, Play, FileText } from 'lucide-react'
import type { Resource } from '../data/types'
import { embedTarget } from '../lib/resourceEmbed'

/**
 * A resource row. The label is always the external link — clicking a resource
 * opens it in a new tab, which is what a reader reaches for most of the time.
 * When the source *can* be shown in place (an allow-listed host, a PDF, a
 * video), a small chip beside it offers an inline preview as the opt-in
 * extra, never the default.
 *
 * Two deliberate behaviours survive from that choice:
 *  - **Nothing loads until asked.** No thumbnails, no third-party requests on
 *    page load — YouTube is contacted only if the preview chip is clicked.
 *  - **No fake previews.** Sites that refuse framing simply have no chip
 *    (see `resourceEmbed`), rather than an iframe that renders as a blank box.
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

        {r.url ? (
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

        {embed && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            title={open ? 'Close inline preview' : 'Preview here without leaving'}
            className="flex shrink-0 items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-faint transition-colors hover:border-hud/50 hover:text-ink"
          >
            {embed.kind === 'youtube' ? (
              <Play className="h-2.5 w-2.5" />
            ) : (
              <FileText className="h-2.5 w-2.5" />
            )}
            {embed.hint}
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
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
            link instead.
          </p>
        </div>
      )}
    </li>
  )
}
