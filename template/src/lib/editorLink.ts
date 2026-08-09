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

/** Encode each path segment but keep the separators — `encodeURI` alone leaves `#` and `?` live. */
function encodePath(abs: string): string {
  return abs.split('/').map(encodeURIComponent).join('/')
}

/** Join the repo root and a repo-relative path without doubling or dropping the separator. */
export function absolutePath(repoRoot: string, relPath: string): string {
  return `${repoRoot.replace(/\/+$/, '')}/${relPath.replace(/^\/+/, '')}`
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
 * Ask the dev server to open the file, since it is the process that actually
 * lives on the machine holding the repo.
 *
 * This is the path that works. The `vscode://` link is the fallback, not the
 * other way round: a browser gates protocol handlers behind a prompt it
 * refuses to let an `http://localhost` origin remember, and resolves the URL
 * on whatever device is showing the page rather than the one running the
 * server. See vite-open-in-editor.ts.
 *
 * Resolves to `null` on success, or a sentence explaining the failure —
 * including the case where the server has no such route, which is what
 * happens when a ground school is served as static files by something other
 * than Vite.
 */
export async function requestOpen(
  editor: EditorId,
  abs: string,
  line?: number,
): Promise<string | null> {
  try {
    const res = await fetch('/__open', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ editor, path: abs, line }),
    })
    if (res.ok) return null
    // A plain static host answers 404 for an unknown POST route, and an HTML
    // error page is not a reason we can quote at the reader.
    const body = await res.json().catch(() => null)
    return (body as { reason?: string } | null)?.reason ?? 'The server could not open it.'
  } catch {
    return 'No dev server to ask — this page is being served statically.'
  }
}
