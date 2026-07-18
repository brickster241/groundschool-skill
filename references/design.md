# Design — the fixed system and the per-repo surface

The template ships a complete, deliberate visual identity. **Instantiation personalizes
content, not chrome** — the design system is shared across every ground school so that the
craft invested once (spacing, motion, focus states, reduced-motion, contrast) is inherited by
every repo, and so a user with several dashboards gets one coherent product. Do not restyle
the shell per repo. If you extend the UI, extend it in the template's language, described here.

## The identity: night-cockpit

An instrument panel at night, not a "dark dashboard": blue-black surfaces, one warm working
accent (instrument-backlight amber), cool HUD blue for data, and per-phase identifying hues.
The metaphor is aviation ground school — placard labels, challenge/response checklists,
mono indices — chosen because the product IS a pre-flight curriculum.

## Tokens (from `src/index.css` `@theme`)

| Token | Value | Role |
|---|---|---|
| `night` | `#0B0E14` | page (blue-black, never pure black) |
| `panel` / `panel2` | `#11151D` / `#161C27` | raised surface / hover |
| `line` | `#232B38` | hairline borders |
| `ink` / `dim` / `faint` | `#E6EDF3` / `#8B98A9` / `#5B6675` | text hierarchy |
| `amber` | `#FFB454` | THE working accent: progress, active, primary actions |
| `hud` | `#7DD3FC` | data, links, code paths |
| `ok` / `warn` | `#4ADE80` / `#F87171` | status only — never decorative |

Type: **Chakra Petch** (display — squared, avionics), **IBM Plex Sans** (body),
**IBM Plex Mono** (indices, placards, readouts). Self-hosted via fontsource; the app makes no
network requests except user-clicked video embeds.

Texture: a barely-there blueprint grid on the body. No gradients, no glows, no starfields.

## Recurring elements (use these, don't invent parallels)

- **Placard** (`.placard`): mono, uppercase, letterspaced section label.
- **Mono index**: `T03·L1·04`, `W02·01` — sequence encoded, real information not decoration.
- **Challenge/response row** (`CheckRow`): checkbox → index → kind chip → text; detail expands
  beneath; completion = amber spring-stamp + strikethrough + dim.
- **Progress ring** (`ProgressRing`): phase-colored, spring-animated.
- **The schematic** (`PipelineSchematic`): the one signature element — spine with a flowing
  amber pulse, stage nodes in phase colors. One per app, on the dashboard only.
- **Checkride** (`Checkride`): the per-track exam — hud-blue framing (assessment, not
  progress), mono option letters, ok/warn feedback states, best score in the header.
- **Flash deck** (`FlashDeck`): 3D flip cards (spring rotateY, stacked-deck peek behind,
  progress dots — a thin bar past 40 cards, ←/→/space keys). Front face hud-labeled PROMPT,
  back face amber ANSWER. Lives on track pages and the Revision page; ephemeral by design.
- **Diagram panel** (`DiagramPanel`): inline SVG architecture figures with placard title,
  caption, and a spring lightbox. The SVG language: transparent background, `#11151D` boxes
  on `#232B38` hairlines (rx 8–10), IBM Plex Mono labels (`#E6EDF3` titles / `#8B98A9` dim /
  `#7DD3FC` file paths), **amber reserved for the one main flow**, dashed strokes for
  return/feedback paths, arrowheads `#5B6675` (amber on the main flow). One idea per
  diagram; viewBox ~860 wide so inline rendering stays legible.
- **Branch switcher** (in `Layout`): mono branch chips with a spring `layoutId` pill;
  appears only when the registry has more than one branch.
- **Deprecation banner**: warn-colored archive placard — `warn` appears only here, in
  destructive confirmation, and in wrong Checkride answers.

## Motion rules — and the animation-library policy

Two libraries, two jobs, deliberately:

- **`motion/react`** owns *structural* animation: entrances, layout, springs, presence
  (AnimatePresence). Anything that moves an element moves via motion.
- **`anime.js` (v4)** owns *numeric/timeline* flourishes: the `CountUp` stat counters are
  the canonical use. Reach for it when animating a **value** rather than an element; keep
  each use wrapped in a small component (like `CountUp`) so the seam stays visible.
- **Do not add component-collection libraries (reactbits and kin).** Pre-styled components
  arrive carrying their own design opinions and fight the token system; this shell's
  identity comes from tokens + typography, and every element must be built in them.

Rules for either library: entrance staggers ≤ 0.06s/item, one-shot, never looping
(exception: the schematic's pulse, the identity's single ambient animation). Everything
respects `prefers-reduced-motion` (CSS handles the pulse; `CountUp` checks the media query;
keep new motion behind the same discipline). If an addition needs a second ambient
animation, it is probably wrong.

## The per-repo surface (all of it lives in `src/data/`)

| Field | What it personalizes |
|---|---|
| `meta.repoName` | wordmark + hero |
| `meta.eyebrow` / `intro` / `motto` / `statusChips` | hero + footer voice |
| `meta.systemMapTitle` / `systemMapFlow` | the schematic, in the repo's vocabulary |
| `phases[].color` | the identifying hues (pick 4–6 distinguishable pastels on dark; amber
  first is a good convention) |
| `phases[].name` | the arc's chapter names — name them for THIS repo's journey |

Copy is design: hero intro ≤ 2 sentences; phase blurbs one clause; taglines one sentence.
The dashboard should read like the repo's own cockpit, not a template with a name injected —
that effect comes entirely from the words, which is why curriculum.md holds the voice bar.
