import type { TrackDraft } from '../../../data/types'

export const t02: TrackDraft = {
  id: 't02',
  num: 2,
  slug: 'editor-bridge',
  title: 'The editor bridge',
  tagline: 'Why clicking a code anchor asks the dev server, not the browser.',
  phase: 'shell',
  hours: [1, 2],
  difficulty: 3,
  dependsOn: ['t00'],
  mentalModel:
    'A code anchor must open a real file in the reader\'s editor. The obvious tool is a protocol URL — `vscode://file/…` — and it is a trap with three jaws. Chromium gates custom protocols behind a permission prompt whose "always allow" checkbox is offered to **secure origins only**, so a dashboard on `http://localhost` prompts on every single click, forever. The URL is resolved by whichever device shows the page, so reading on a phone tries to launch an editor on the phone. And a protocol navigation that goes nowhere fires no event — the page cannot even apologise.\n\nThe fix inverts who is asked. The dev server already runs on the machine holding the repo, so the anchor POSTs to `/__open` and a Vite plugin runs the editor\'s own CLI. One fetch, no prompt, and a JSON status the row can show. The protocol URL survives only as the fallback for a statically served copy — reached when the response proves no plugin answered, by body shape, not status code.',
  why:
    'The endpoint spawns a process on request, so its trust boundary is drawn tight and each line of it is deliberate: loopback callers only (`--host` puts the server on the LAN — the check is what stops a phone on the same wifi), a fixed table of editor commands so the request never supplies one, `execFile` with an argument array so a path with a space is data rather than shell syntax, and a `path.relative` containment check that makes `../../../.ssh/id_rsa` a 403 instead of an open. Windows gets a shell because `.cmd` shims demand one — safe only because `"` cannot appear in a Windows path, which is the kind of reasoning that must be written down where the code is.',
  anchors: [
    { path: 'template/vite-open-in-editor.ts', note: 'The endpoint and its entire trust boundary, argued in comments.' },
    { path: 'template/src/lib/editorLink.ts', note: 'requestOpen and the three-state OpenResult — opened / no-route / refused.' },
    { path: 'template/src/pages/TrackPage.tsx', note: 'AnchorRow: server first, protocol URL only when no route exists, reasons shown in the row.' },
  ],
  lessons: [
    {
      title: 'Why the browser cannot be trusted with this',
      summary: 'Each of the three failure modes of a protocol link, observed rather than recited.',
      items: [
        { kind: 'run', text: 'Click a vscode:// link from an http://localhost page and watch the prompt', detail: 'No "remember" checkbox appears. Chromium offers persistence for handlers to secure origins only.' },
        { kind: 'quiz', text: 'What happens when the same link is tapped on a phone?', detail: 'The phone tries to resolve it — an editor there, or silence. The URL names a scheme, not a machine.' },
        { kind: 'quiz', text: 'How does a page detect that a protocol navigation went nowhere?', detail: 'It cannot. No event, no error, no navigation. That silence is the original bug report behind this whole design.' },
      ],
    },
    {
      title: 'The trust boundary',
      summary: 'Read the endpoint as an attacker first, then as a maintainer.',
      items: [
        { kind: 'read', text: 'Read the four guards in vite-open-in-editor.ts in order', detail: 'Loopback, editor table, absolute-path + containment, file-exists. Each rejects a specific attack; name it as you go.' },
        { kind: 'run', text: 'curl the endpoint with a path outside the repo and read the refusal', detail: 'A 403 with a quotable reason. Try `../` traversal too — path.relative catches what string prefixing would miss.' },
        { kind: 'quiz', text: 'Why is quoting arguments on Windows safe here when it is usually a bug?', detail: 'The only request-controlled text is a validated file path, and `"` is not a legal character in Windows paths. The command itself comes from a fixed table.' },
        { kind: 'build', text: 'Add an editor to the table end-to-end', detail: 'EDITOR_ARGV in the plugin, EDITORS in editorLink.ts. Two files, and the row picks it up untouched.' },
      ],
    },
  ],
  deepDive: {
    title: 'Why the fallback discriminates by body, not status',
    body:
      'The plugin answers 404 for a missing file; a static host answers 404 for a missing route. Same number, opposite meanings. The plugin always sends `{ok:false, reason}` JSON though, and a generic error page never does — so `requestOpen` parses rather than pattern-matching on numbers. Three states come out: opened, refused-with-reason, no-route. Only the last one earns the protocol URL.',
  },
  proveIt: [
    'Serve the built dist/ with any static server and click an anchor: the fetch finds no route, and the protocol URL takes over. That fallback chain is the design working, not failing.',
    'Rename your editor CLI so it is not on PATH and click an anchor — the row should tell you exactly that, with the fix.',
  ],
  resources: [
    { label: 'child_process.execFile', url: 'https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback', kind: 'doc' },
  ],
}
