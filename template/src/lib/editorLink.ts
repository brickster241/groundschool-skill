/**
 * Opening a repo file at a line, from a browser.
 *
 * Two things the previous implementation got wrong, both of which produced the
 * same symptom — a click that silently does nothing:
 *
 *  1. **Paths were not encoded.** A repo path containing a space (or any
 *     non-ASCII character) produced a malformed URL that the OS handler drops
 *     on the floor without an error.
 *  2. **Every editor was assumed to share one scheme shape.** VS Code, Cursor,
 *     Windsurf and Zed roughly do. JetBrains routes through a query string and
 *     Sublime wraps a `file://` URL — a `jetbrains://file/...` URL is simply
 *     not a thing, so those users had a dead link by construction.
 *
 * And one thing no implementation can fix: **protocol handlers are inherently
 * unreliable from a web page.** The browser may prompt, may remember a
 * previous "no", may block the navigation, or the editor may not be
 * registered. There is no callback and no error event — the page cannot tell
 * whether it worked. So every anchor also exposes a shell command, which has
 * no such failure mode. That is the escape hatch, not a nicety.
 */

export type EditorId =
  | 'vscode'
  | 'vscode-insiders'
  | 'cursor'
  | 'windsurf'
  | 'zed'
  | 'jetbrains'
  | 'sublime'

/** True for `C:\…` / `C:/…` — a curriculum authored on Windows. */
function isWindowsPath(p: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(p)
}

/**
 * Encode each path segment but keep the separators — `encodeURI` alone leaves
 * `#` and `?` live. Windows paths are normalised to forward slashes and given
 * the leading `/` the `file` URL form requires: VS Code expects
 * `vscode://file/c:/repo/main.go`, not `vscode://fileC:\repo\main.go`.
 */
function encodePath(abs: string): string {
  const posix = abs.replace(/\\/g, '/')
  const prefixed = posix.startsWith('/') ? posix : `/${posix}`
  // Segment-wise so the separators survive; drive-letter colon must too.
  return prefixed
    .split('/')
    .map((seg) => (/^[a-zA-Z]:$/.test(seg) ? seg : encodeURIComponent(seg)))
    .join('/')
}

/**
 * Join the repo root and a repo-relative path without doubling or dropping the
 * separator. Anchors always use `/` (they are authored repo-relative); the
 * root keeps whatever separator style its OS gave it, which Windows APIs and
 * every editor CLI accept mixed with `/`.
 */
export function absolutePath(repoRoot: string, relPath: string): string {
  return `${repoRoot.replace(/[\\/]+$/, '')}${isWindowsPath(repoRoot) ? '\\' : '/'}${relPath.replace(/^\/+/, '')}`
}

interface EditorSpec {
  /** Display name for tooltips and labels. */
  name: string
  /**
   * Protocol-handler URL, or `null` for editors that have no working file+line
   * URL form at all. Zed and Sublime are in that category: emitting a
   * `zed://file…` URL produces a link that can never resolve, which is worse
   * than showing no link, because the learner blames themselves for the
   * silence. Those editors get the shell command only.
   */
  href: ((abs: string, line?: number) => string) | null
  /** Shell command that always works, for the copy-command fallback. */
  cli: (abs: string, line?: number) => string
}

const EDITORS: Record<EditorId, EditorSpec> = {
  vscode: {
    name: 'VS Code',
    href: (p, l) => `vscode://file${encodePath(p)}${l ? `:${l}:1` : ''}`,
    cli: (p, l) => `code -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  'vscode-insiders': {
    name: 'VS Code Insiders',
    href: (p, l) => `vscode-insiders://file${encodePath(p)}${l ? `:${l}:1` : ''}`,
    cli: (p, l) => `code-insiders -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  cursor: {
    name: 'Cursor',
    href: (p, l) => `cursor://file${encodePath(p)}${l ? `:${l}:1` : ''}`,
    cli: (p, l) => `cursor -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  windsurf: {
    name: 'Windsurf',
    href: (p, l) => `windsurf://file${encodePath(p)}${l ? `:${l}:1` : ''}`,
    cli: (p, l) => `windsurf -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  zed: {
    // Zed registers no file+line URL scheme. `zed <path>:<line>` on the CLI is
    // the only reliable way in, so that is what we offer.
    name: 'Zed',
    href: null,
    cli: (p, l) => `zed ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  jetbrains: {
    // Query-string shape, not path shape. Without a project name JetBrains
    // resolves against the last open project, which is usually what you want
    // from a ground school sitting inside that project.
    name: 'JetBrains',
    href: (p, l) =>
      `jetbrains://idea/navigate/reference?path=${encodeURIComponent(p)}${l ? `%3A${l}` : ''}`,
    cli: (p, l) => (l ? `idea --line ${l} ${shellQuote(p)}` : `idea ${shellQuote(p)}`),
  },
  sublime: {
    // `subl://open?url=…` exists in the wild but is not a documented, reliably
    // registered handler across installs. CLI only, for the same reason as Zed.
    name: 'Sublime Text',
    href: null,
    cli: (p, l) => `subl ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
}

/** Single-quote for POSIX shells, escaping any embedded single quote. */
function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`
}

export interface OpenTarget {
  /**
   * Protocol-handler URL, or `null` when this editor has no such form.
   * Even when present it may not fire — the browser will not tell us.
   */
  href: string | null
  /** Shell command that always works. This is the reliable path. */
  cli: string
  /** Absolute path, for plain copying. */
  abs: string
  /** Editor display name. */
  editorName: string
}

/**
 * Build every way of opening `relPath` at `line`. Returns null only when the
 * curriculum opted out of editor integration (`editor: null`), in which case
 * callers should still offer the plain path to copy.
 */
export function openTarget(
  editor: EditorId | null | undefined,
  repoRoot: string,
  relPath: string,
  line?: number,
): OpenTarget | null {
  const abs = absolutePath(repoRoot, relPath)
  if (!editor) return null
  const spec = EDITORS[editor]
  // An unknown editor id in a hand-written meta.ts should degrade to copy-only
  // rather than emitting a URL with a scheme nothing on the machine answers.
  if (!spec) return null
  const safeLine = Number.isInteger(line) && (line as number) > 0 ? line : undefined
  return {
    href: spec.href ? spec.href(abs, safeLine) : null,
    cli: spec.cli(abs, safeLine),
    abs,
    editorName: spec.name,
  }
}

export const EDITOR_IDS = Object.keys(EDITORS) as EditorId[]
export const editorName = (id: EditorId): string => EDITORS[id].name

/**
 * Outcome of asking the server to open a file.
 *
 * Three states, not two, because "there is no such route" is a different
 * situation from "the route said no": the first means fall back to the
 * protocol URL, the second means show the reason. Collapsing them into a
 * string and matching on its text is how the fallback quietly stops working.
 */
export type OpenResult =
  | { kind: 'opened' }
  /** Nothing is listening for `/__open` — a statically served copy. */
  | { kind: 'no-route' }
  | { kind: 'refused'; reason: string }

/**
 * Ask the dev server to open the file, since it is the process that actually
 * lives on the machine holding the repo.
 *
 * This is the path that works. The `vscode://` link is the fallback, not the
 * other way round: a browser gates protocol handlers behind a prompt it
 * refuses to let an `http://localhost` origin remember, and resolves the URL
 * on whatever device is showing the page rather than the one running the
 * server. See vite-open-in-editor.ts.
 */
export async function requestOpen(
  editor: EditorId,
  abs: string,
  line?: number,
): Promise<OpenResult> {
  let res: Response
  try {
    res = await fetch('/__open', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ editor, path: abs, line }),
    })
  } catch {
    // Connection refused, offline, blocked — nothing answered at all.
    return { kind: 'no-route' }
  }

  if (res.ok) return { kind: 'opened' }

  // `fetch` does not throw on an HTTP error, so this branch runs both when
  // the plugin refused and when the page is served by something without the
  // plugin at all (a static host answering an unknown POST with 404/405).
  // Status codes cannot tell those apart — the plugin itself uses 404 for a
  // missing file — but the body can: the plugin always sends
  // `{ok:false, reason}`, and a generic error page is HTML. Parse, don't
  // pattern-match on numbers.
  const body = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
  if (body && body.ok === false && typeof body.reason === 'string') {
    return { kind: 'refused', reason: body.reason }
  }
  return { kind: 'no-route' }
}
