# Engineering notes

The interesting problems in this template were not React. They were about what browsers
actually do — and most of them punished the obvious guess. This file is the record, kept
because each of these cost a real afternoon and would cost the next maintainer another one.

The interesting problems here were not React. They were about what browsers actually do, and
most of them punished the obvious guess.

**A blocked iframe is invisible to JavaScript.** The tempting design is "try to embed, fall
back to a link on failure". There is no failure to catch: for a frame refused by
`X-Frame-Options`, the `load` event fires exactly as it does on success, no `error` event is
dispatched, and reading `contentDocument` throws for *every* cross-origin frame whether it
rendered or not. The decision has to be made before render, so embedding runs off an
allow-list — and [`scripts/probe-framing.sh`](scripts/probe-framing.sh) re-measures that list
so it stays falsifiable. Writing the probe immediately caught two entries I had put on the list
from memory: `pkg.go.dev` sends `X-Frame-Options: deny`, and `datatracker.ietf.org` scopes
`frame-ancestors` to the IETF's own domains. Measuring beats remembering, which is the whole
argument for keeping the probe in the repo.

**arXiv's `/abs/` page and its `/pdf/` URL disagree.** `/abs/` — the URL everyone pastes —
sends both `frame-ancestors 'none'` and `X-Frame-Options: SAMEORIGIN`; `/pdf/` sends neither
and is served `content-disposition: inline`. So papers preview inline only because the link is
rewritten first. That rewrite is load-bearing, not cosmetic.

**Chromium will not let `http://localhost` remember a protocol handler.** Code anchors used to
be `vscode://file/…` links. The permission prompt they raise offers its "always allow"
checkbox to secure origins only, so a dashboard on localhost prompts *every single time*; the
URL is resolved by whichever device is showing the page, so reading on a phone over
`vite --host` tries to launch an editor on the phone; and a protocol navigation that goes
nowhere fires no event, so the page cannot even apologise. The fix was to stop asking the
browser: [a Vite plugin](template/vite-open-in-editor.ts) exposes `POST /__open` and runs the
editor's own CLI, because the server is already on the machine holding the repo. Loopback
callers only, a fixed table of editor commands rather than one from the request, `execFile`
with an argument array, and paths that must resolve inside the documented repo. The protocol
URL survives as the fallback for a statically served copy.

**`navigator.clipboard` does not exist off a secure context.** The dev server binds `--host` so
you can read the material on a phone — which means a LAN-IP origin, which means the clipboard
API is simply absent. A copy button that flashes a green tick while copying nothing is how you
paste the wrong thing into a terminal, so `copyText` returns a boolean the UI has to respect,
and on failure it reveals the selectable text instead.

**`url(#arrow)` resolves to the first match in document order.** Every diagram is injected
twice — once inline, once in the lightbox — and hand-drawn SVGs reuse obvious ids (`arrow`,
`grad`, `clip`). Sharing them makes one diagram silently borrow another's marker, which reads
as a rendering bug on your machine rather than a bug in the app. Ids are namespaced per
instance, parsed as HTML rather than XML on purpose: a diagram using `xlink:href` without
declaring `xmlns:xlink` is valid HTML and malformed XML, and the strict parser would have
skipped the rewrite silently.

## Platforms

macOS, Linux and Windows. The only platform-sensitive part is the editor bridge, and it is
handled where it bites: Windows editor CLIs are `.cmd` shims that Node refuses to spawn without
a shell, so the plugin uses one there — safe precisely because `"` cannot appear in a Windows
path and the command itself comes from a fixed table. Editor URLs normalise `C:\` paths to the
`vscode://file/c:/…` form, and JetBrains gets its line number as a separate argument because
splitting `C:\repo\main.go:12` on `:` is not a thing that can be done.

## Roadmap

- **Animated segments for the genuinely hard topics.** The diagrams are static SVG today;
  for material where motion carries the idea (consensus rounds, cache line behaviour, merge
  frontiers), pre-rendered animation clips — Manim or similar — served as local video with the
  same nothing-loads-until-clicked rule. Rendered at generate time, so readers never need the
  toolchain.
- **An anchor linter** that re-verifies every `path`/`line` in a curriculum against the repo,
  as a single command — today this lives inside the UPDATE protocol only.
- **Import/export of progress** between browsers, since the data is one JSON blob already.
