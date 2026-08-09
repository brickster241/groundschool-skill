/**
 * Deciding whether a resource can be shown *inside* the app.
 *
 * The temptation is to iframe every link. Don't: most sites send
 * `X-Frame-Options: DENY` or a `frame-ancestors` CSP, and a blocked iframe
 * renders as a silent blank rectangle — strictly worse than an honest link,
 * because the learner cannot tell the difference between "still loading",
 * "blocked" and "broken".
 *
 * So this is an allow-list keyed on what actually embeds, and everything else
 * is explicitly an external link. When in doubt, link out.
 */

export type EmbedKind = 'youtube' | 'pdf'

export interface EmbedTarget {
  kind: EmbedKind
  /** URL to put in the iframe — often a *transform* of the link the author wrote. */
  src: string
  /** Human label for the click-to-load placard. */
  hint: string
}

const YT_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

/** Pull the 11-char video id out of any of YouTube's URL shapes. */
function youtubeId(u: URL): string | null {
  if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1).split('/')[0] || null
  if (u.pathname === '/watch') return u.searchParams.get('v')
  const m = u.pathname.match(/^\/(?:embed|v|shorts|live)\/([^/?#]+)/)
  return m ? m[1] : null
}

/** Seconds offset from `?t=` / `?start=`, accepting `90`, `90s`, `1m30s`. */
function youtubeStart(u: URL): number | null {
  const raw = u.searchParams.get('start') ?? u.searchParams.get('t')
  if (!raw) return null
  if (/^\d+$/.test(raw)) return Number(raw)
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m || (!m[1] && !m[2] && !m[3])) return null
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
}

/**
 * Resolve a resource URL to something embeddable, or null when it should open
 * externally. `force` mirrors the author's explicit `embed` flag: `false`
 * suppresses a preview we would otherwise offer, `true` is *not* honoured for
 * arbitrary hosts — an author cannot will a blocked site into an iframe.
 */
export function embedTarget(url: string | undefined, force?: boolean): EmbedTarget | null {
  if (!url || force === false) return null

  let u: URL
  try {
    u = new URL(url)
  } catch {
    return null
  }
  // Only ever frame https. An http iframe inside an https page is blocked as
  // mixed content, and framing http from a localhost dev server is a downgrade
  // we should not normalise.
  if (u.protocol !== 'https:') return null

  if (YT_HOSTS.has(u.hostname)) {
    const id = youtubeId(u)
    if (!id) return null
    const start = youtubeStart(u)
    // youtube-nocookie is the privacy-preserving host and is designed to be framed.
    return {
      kind: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${
        start ? `?start=${start}` : ''
      }`,
      hint: 'YOUTUBE',
    }
  }

  // arXiv abstract pages are framable but the PDF is what a learner wants.
  const arxiv = u.hostname.endsWith('arxiv.org') && u.pathname.match(/^\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/)
  if (arxiv) {
    return { kind: 'pdf', src: `https://arxiv.org/pdf/${arxiv[1]}`, hint: 'ARXIV PDF' }
  }

  if (/\.pdf($|[?#])/i.test(u.pathname + u.search)) {
    return { kind: 'pdf', src: u.toString(), hint: 'PDF' }
  }

  // Everything else: an honest external link beats a blank rectangle.
  return null
}
