---
name: groundschool
description: Use when the user asks to create a learning dashboard, "ground school", interactive curriculum, or study tracker for a repository or codebase — or to update, sync, or refresh an existing groundschool/ dashboard after the repo has changed.
---

# Groundschool

Turn a repository into a personal flight school: a deeply-researched curriculum about the
fundamentals *underneath* the code, rendered as a local-first interactive dashboard
(tracks → lessons → typed checklists, code anchors that open the editor, notes, glossary,
optional study plan, progress that persists). The learner already has the code; the product
is *understanding*, organized and trackable.

Two modes — detect which applies before doing anything:

| Signal | Mode |
|---|---|
| No `groundschool/` directory in the target repo (or user asks for a fresh one) | **GENERATE** |
| `groundschool/` exists and user asks to update/sync/refresh it | **UPDATE** — follow `references/update.md` and skip the rest of this file |

A generated dashboard is a *copy* of the bundled template, not a link to it. That is why
UPDATE re-syncs the app shell before it touches curriculum: otherwise every dashboard ever
generated keeps the bugs it was born with. The boundary is in `references/update.md` § 0 and
it is the same one GENERATE relies on — **the shell is skill-owned, `src/branches/**` is
instance-owned.** Never fork a shell file for one repo.

Never run UPDATE spontaneously because commits happened. It runs only when the user asks.

## Mode: GENERATE

Work through these stages in order. Do not skip a gate.

### 1. Target and branch gate

- Confirm the target repo path. If the conversation doesn't pin it down, ask.
- **Default to the currently checked-out branch — do not ask.** Ask only when the user names
  a different branch, HEAD is detached, or they ask for several branches.
- Branch curricula **coexist**: content lives at `groundschool/src/branches/<branch>/` (one
  folder per branch, registered in `src/branches/index.ts`), one dev server serves them all,
  a sidebar switcher flips between them, and progress/notes are kept per branch. Adding a
  branch to an existing dashboard = author a new branch folder + registry entry — never touch
  other branches' folders.
- If a requested branch is not checked out, analyze it via `git worktree add` to a temp dir
  rather than disturbing the user's working tree; remove the worktree when done.

### 2. Analyze the repo → curriculum plan

Follow `references/analysis.md`. Its output is a written plan
(`groundschool/docs/curriculum-plan.md`): the system map, the track table (phases, hours,
difficulty, dependencies), per-track anchor lists, and the external-knowledge domains the
curriculum must teach. **Do not start authoring until the plan exists** — authoring against a
vague plan produces documentation, not curriculum.

If the user's learning goals are ambiguous (learn to extend the repo? understand the theory
under it? prepare for a related real-world goal?), ask — one question, up to 4 options. The
goal changes which deep-dives and which external tracks (theory, tooling, hardware…) earn a
place.

### 3. Instantiate the template

The app shell is bundled with this skill and is already verified — **copy it, never rebuild
it from scratch and never fork its internals for one repo**:

```bash
rsync -a --exclude node_modules --exclude dist --exclude .git \
  "<this skill's directory>/template/" "<repo>/groundschool/"
cd "<repo>/groundschool" && npm install
```

Then make it the repo's own:

- Delete the bundled demo branches (`src/branches/main/` — the template's self-curriculum — and
  `src/branches/sandbox/`) and
  create `src/branches/<branch>/` for the target branch. Register it in
  `src/branches/index.ts`: the bundle entry, `defaultBranch`, and `storeKey`
  (`groundschool-<repo>-v2`, unique per repo).
- Fill in every field of the branch's `meta.ts` (the `Meta` type's doc comments are the
  spec). Stamp `baseline` from `git rev-parse --short HEAD` + branch + today's date.
- Set `<title>` in `index.html` to "<Repo> Ground School".
- Replace `README.md` with a repo-specific one (what this dashboard is, how to run it —
  the dev server binds `--host`, so it is reachable from other devices on the LAN —
  the append-only editing rule, and the branch-folder layout).

### 4. Author the curriculum

Follow `references/curriculum.md` — it is the quality bar, the voice, and the per-field spec.
Author into `src/branches/<branch>/`: `tracks/` (the example track shows every supported
feature), `pipeline.ts`, `glossary.ts`, `planner.ts` (optional), `flashcards.ts` (per-concept
revision decks — author these for every substantial track), `quizzes.ts` (Checkrides —
optional per track, concept-weighted), `diagrams.ts` + `diagrams/*.svg` (architecture
figures for every architecture-heavy track — audit the repo's own diagrams first per
analysis.md; accuracy over decoration), `articles.ts` (optional long-form chapters —
typed blocks with lazy KaTeX math, callouts, figures, worked derivations; for theory-heavy
subjects where checklists alone go thin), `widgets.tsx` (optional interactive instruments —
branch-owned React components the shell frames and crash-isolates; embed them mid-chapter
via `widget` blocks), and the phases/imports in the branch's `index.ts`.

Design decisions for any UI you touch (normally none) come from `references/design.md`.

### 5. Wire into the host repo

- Append `groundschool/` to the host repo's `.gitignore` (create if absent; skip if already
  listed). **Guard against a missing trailing newline** — append with something like
  `printf '\n%s\n' 'groundschool/' >> .gitignore`, never a bare `echo >>`: a file whose last
  line has no newline will fuse with the appended entry (`.vscodegroundschool/`) and silently
  ignore neither. Do not commit the host repo unless asked.
- Inside `groundschool/`: `git init`, then an initial commit — the dashboard is its own
  repo with its own history (UPDATE runs append to it).
- Write `groundschool/CHANGELOG.md` with a dated "Initial curriculum" entry naming the
  baseline branch@commit.

### 6. Verify — hard gate, no exceptions

`npm run build` must pass, then load the app in a browser (dev server or `vite preview`),
and confirm with your own eyes: dashboard renders with real numbers, one track page shows
lessons/checklists/anchors, a check toggles and survives reload, no console errors. A
dashboard delivered without this pass is not done. Screenshot for the final summary.

Two integrations fail *silently* when misconfigured, so check them by hand rather than by
sight:

- **A code anchor opens the editor.** Click one. The click POSTs to `/__open` and the file
  should appear in the editor named by `meta.editor`. If the row shows a reason instead,
  believe it — usually `repoPathAbs` is wrong, or the editor's CLI is not on `PATH`.
- **A resource with a URL previews inline.** Only an allow-listed host will; everything else
  is deliberately an external link. See `src/lib/resourceEmbed.ts` before assuming a blank
  panel is a bug — a frame refused by the remote host is undetectable from JavaScript, which
  is exactly why the list exists.

### 7. Deliver

Summarize: track list with one-liners, the counts (tracks/lessons/items/hours), where it
lives, how to run it, and the append-only editing rule.

## Quality bar — the difference between this and a README generator

- Every code anchor verified to exist (`ls` the path) before it enters the data.
- Every track has a real "why this repo does it this way" — a trade-off, not a summary.
- Quiz items carry answers in `detail`. Prove-its have observable results.
- The curriculum teaches the knowledge *underneath* the repo (theory, protocols, algorithms,
  tooling), not just a tour of its files. External resources are canonical, not SEO filler.
- Honest numbers: hours, difficulty, and lesson counts a learner can trust.

## Red flags — stop and fix

- Authoring tracks before the plan doc exists.
- An anchor path you never verified.
- A track whose "why" paragraph would be true of any repo.
- Editing the template's shell components for one repo's content needs (content belongs in
  `src/branches/<branch>/`; the shell is shared and gets overwritten on the next UPDATE).
- Declaring done without the browser pass.
- Running UPDATE because commits exist rather than because the user asked.

## Skill layout

- `references/analysis.md` — repo analysis → curriculum plan
- `references/curriculum.md` — authoring spec and quality bar
- `references/design.md` — the visual system; what is fixed vs per-repo
- `references/update.md` — the incremental UPDATE protocol (append-only, deprecation)
- `template/` — the verified app (builds standalone with example data)
