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

export type EmbedKind = 'youtube' | 'pdf' | 'page'

/**
 * Hosts verified (2026-07-31, by response header) to send neither
 * `X-Frame-Options` nor a `frame-ancestors` CSP, so their pages render in a
 * frame. These are the reference sites curricula actually cite.
 *
 * This list can rot — a site may add framing headers at any time, and there is
 * no way to find out from the browser (see the note on detection below). The
 * cost of a stale entry is one visibly blank panel next to a working
 * open-in-tab link, which is why that link is never conditional.
 */
const FRAMEABLE_HOSTS = [
  'www.rfc-editor.org',
  'rfc-editor.org',
  'datatracker.ietf.org',
  'git-scm.com',
  'en.wikipedia.org',
  'man7.org',
  'pkg.go.dev',
]

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
 * suppresses a preview we would otherwise offer, `true` attempts one for a
 * host not on the verified list.
 *
 * There is deliberately no "try it and fall back" path, because a framing
 * block is undetectable from JavaScript: the iframe's `load` event fires for
 * blocked frames exactly as it does for successful ones, there is no `error`
 * event, and touching `contentDocument` throws for any cross-origin frame
 * whether it rendered or not. The decision has to be made before render —
 * hence an allow-list, and an open-in-tab link that is always present.
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

  // The /abs/ page — the URL people actually paste — sends BOTH
  // `frame-ancestors 'none'` and `X-Frame-Options: SAMEORIGIN`, so framing it
  // is refused outright. /pdf/ sends no framing headers and is served
  // `content-disposition: inline`. This rewrite is mandatory, not cosmetic.
  const arxiv = u.hostname.endsWith('arxiv.org') && u.pathname.match(/^\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/)
  if (arxiv) {
    return { kind: 'pdf', src: `https://arxiv.org/pdf/${arxiv[1]}`, hint: 'ARXIV PDF' }
  }

  if (/\.pdf($|[?#])/i.test(u.pathname + u.search)) {
    return { kind: 'pdf', src: u.toString(), hint: 'PDF' }
  }

  if (FRAMEABLE_HOSTS.includes(u.hostname)) {
    return { kind: 'page', src: u.toString(), hint: 'PAGE' }
  }

  // An author who knows their source can force a preview. It is a real lever,
  // not a wish: the panel renders, and if the host refuses framing the learner
  // sees an empty box beside the open-in-tab link rather than a broken app.
  if (force === true) return { kind: 'page', src: u.toString(), hint: 'PAGE' }

  // Everything else: an honest external link beats a blank rectangle.
  return null
}
