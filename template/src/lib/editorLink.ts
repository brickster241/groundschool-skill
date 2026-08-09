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
  /** Protocol-handler URL. `line` is already validated to be a positive integer or undefined. */
  href: (abs: string, line?: number) => string
  /** Shell command that always works, for the copy-command fallback. */
  cli: (abs: string, line?: number) => string
}

const EDITORS: Record<EditorId, EditorSpec> = {
  vscode: {
    name: 'VS Code',
    href: (p, l) => `vscode://file${encodePath(p)}${l ? `:${l}` : ''}`,
    cli: (p, l) => `code -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  'vscode-insiders': {
    name: 'VS Code Insiders',
    href: (p, l) => `vscode-insiders://file${encodePath(p)}${l ? `:${l}` : ''}`,
    cli: (p, l) => `code-insiders -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  cursor: {
    name: 'Cursor',
    href: (p, l) => `cursor://file${encodePath(p)}${l ? `:${l}` : ''}`,
    cli: (p, l) => `cursor -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  windsurf: {
    name: 'Windsurf',
    href: (p, l) => `windsurf://file${encodePath(p)}${l ? `:${l}` : ''}`,
    cli: (p, l) => `windsurf -g ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
  zed: {
    name: 'Zed',
    href: (p, l) => `zed://file${encodePath(p)}${l ? `:${l}` : ''}`,
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
    // Wraps a file:// URL in a query parameter — again, not the path shape.
    name: 'Sublime Text',
    href: (p, l) =>
      `subl://open?url=file://${encodeURIComponent(p)}${l ? `&line=${l}` : ''}`,
    cli: (p, l) => `subl ${shellQuote(`${p}${l ? `:${l}` : ''}`)}`,
  },
}

/** Single-quote for POSIX shells, escaping any embedded single quote. */
function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`
}

export interface OpenTarget {
  /** Protocol-handler URL — may or may not fire; the browser will not tell us. */
  href: string
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
    href: spec.href(abs, safeLine),
    cli: spec.cli(abs, safeLine),
    abs,
    editorName: spec.name,
  }
}

export const EDITOR_IDS = Object.keys(EDITORS) as EditorId[]
export const editorName = (id: EditorId): string => EDITORS[id].name
