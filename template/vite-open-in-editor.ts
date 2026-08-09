import { execFile } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import type { Plugin, Connect } from 'vite'

/**
 * A dev-server endpoint that opens a file in the reader's editor.
 *
 * Why this exists instead of just linking `vscode://file/…`:
 *
 * The protocol link is dispatched by the *browser*, and browsers deliberately
 * make that awkward. Chromium shows an "Open Visual Studio Code?" permission
 * prompt on every click, and its "always allow" checkbox is only offered to
 * secure origins — a ground school served over `http://localhost` can never
 * suppress it. Worse, the URL is resolved by whichever machine is running the
 * browser, so reading on a phone over `vite --host` tries to launch an editor
 * on the phone. And none of it is detectable: a protocol navigation that goes
 * nowhere fires no error, so the page cannot even apologise.
 *
 * The server, by contrast, is already running on the machine that holds the
 * repo. Asking it to run `code -g file:line` is one fetch, no prompt, and it
 * returns a status the UI can actually react to.
 *
 * Scope of trust: this spawns a process on request, so it is deliberately
 * boxed in — loopback callers only, a fixed table of editor commands (never a
 * command from the request), and paths that must resolve inside the repo the
 * ground school documents. `vite --host` puts the server on the LAN, and the
 * loopback check is what stops a phone on the same wifi from opening files.
 */

/**
 * id → argv builder. The request picks an id; it never supplies a command.
 *
 * Builders take the path and line separately rather than a joined
 * `path:line`, because splitting that back apart cannot be done portably —
 * on Windows the drive letter in `C:\repo\main.go:12` is indistinguishable
 * from a line separator.
 */
const EDITOR_ARGV: Record<string, (abs: string, line?: number) => string[]> = {
  vscode: (p, l) => ['code', '-g', l ? `${p}:${l}` : p],
  'vscode-insiders': (p, l) => ['code-insiders', '-g', l ? `${p}:${l}` : p],
  cursor: (p, l) => ['cursor', '-g', l ? `${p}:${l}` : p],
  windsurf: (p, l) => ['windsurf', '-g', l ? `${p}:${l}` : p],
  zed: (p, l) => ['zed', l ? `${p}:${l}` : p],
  sublime: (p, l) => ['subl', l ? `${p}:${l}` : p],
  jetbrains: (p, l) => (l ? ['idea', '--line', String(l), p] : ['idea', p]),
}

function isLoopback(remote: string | undefined): boolean {
  if (!remote) return false
  // Node reports IPv4-mapped IPv6 for a v4 client on a dual-stack socket.
  const addr = remote.startsWith('::ffff:') ? remote.slice(7) : remote
  return addr === '127.0.0.1' || addr === '::1' || addr.startsWith('127.')
}

export interface OpenInEditorOptions {
  /**
   * Directory that requested files must live inside. Defaults to the parent of
   * the Vite root, which is the repo itself for a ground school generated at
   * `<repo>/groundschool` — so there is nothing to keep in sync.
   */
  repoRoot?: string
}

export function openInEditor(options: OpenInEditorOptions = {}): Plugin {
  let root = ''

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url?.split('?')[0] !== '/__open' || req.method !== 'POST') return next()

    const fail = (code: number, reason: string) => {
      res.statusCode = code
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ ok: false, reason }))
    }

    if (!isLoopback(req.socket.remoteAddress)) {
      return fail(403, 'This only works from the machine running the server.')
    }

    let body = ''
    req.on('data', (c) => {
      body += c
      // Nothing legitimate is this long; stop reading rather than buffer forever.
      if (body.length > 4096) req.destroy()
    })
    req.on('end', () => {
      let payload: { path?: unknown; line?: unknown; editor?: unknown }
      try {
        payload = JSON.parse(body)
      } catch {
        return fail(400, 'Malformed request.')
      }

      const editor = typeof payload.editor === 'string' ? payload.editor : ''
      const argvFor = EDITOR_ARGV[editor]
      if (!argvFor) return fail(400, `Unknown editor "${editor}".`)

      if (typeof payload.path !== 'string' || !path.isAbsolute(payload.path)) {
        return fail(400, 'Path must be absolute.')
      }
      const abs = path.resolve(payload.path)
      // `relative` starting with `..` means the path climbed out of the root —
      // the check that makes `../../../.ssh/id_rsa` uninteresting.
      const rel = path.relative(root, abs)
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        return fail(403, 'Path is outside this repository.')
      }
      if (!existsSync(abs) || !statSync(abs).isFile()) {
        return fail(404, 'No such file — the curriculum may be out of date.')
      }

      const line = Number(payload.line)
      const safeLine = Number.isInteger(line) && line > 0 ? line : undefined
      const [cmd, ...args] = argvFor(abs, safeLine)

      // execFile, not exec: arguments are passed as an array, so a path with a
      // space or a quote is data rather than shell syntax.
      //
      // Windows is the exception, on two counts. The VS Code family installs
      // its CLI as a `.cmd` shim, and Node refuses to spawn `.cmd`/`.bat`
      // without a shell (CVE-2024-27980) — so a shell it is. That normally
      // reopens the quoting problem execFile exists to avoid, but not here:
      // `"` is not a legal character in a Windows path, and the path is the
      // only request-controlled text in the argv (the command comes from the
      // fixed table above). Quoting each argument is therefore airtight.
      const windows = process.platform === 'win32'
      const finalArgs = windows ? args.map((a) => `"${a}"`) : args
      execFile(cmd, finalArgs, { timeout: 10_000, shell: windows }, (err) => {
        if (err) {
          const missing = (err as NodeJS.ErrnoException).code === 'ENOENT'
          return fail(
            missing ? 501 : 500,
            missing
              ? `\`${cmd}\` is not on PATH. In VS Code: Command Palette → "Shell Command: Install 'code' command in PATH".`
              : err.message,
          )
        }
        res.statusCode = 200
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ ok: true }))
      })
    })
  }

  return {
    name: 'groundschool:open-in-editor',
    apply: () => true,
    configResolved(config) {
      root = options.repoRoot ?? path.resolve(config.root, '..')
    },
    // Both servers: a ground school is usually read through `npm run preview`,
    // and an editor link that works in dev but not in preview is the same bug
    // wearing a different hat.
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
