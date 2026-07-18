# Repo analysis → curriculum plan

The analysis phase answers one question: **what knowledge, in what order, would let a smart
person own this system?** Its output is `groundschool/docs/curriculum-plan.md`. Authoring
without this plan produces a file tour; with it, a curriculum.

## Source priority

Read in this order — each layer corrects the one below it:

1. **The repo's own words.** README, `docs/`, ADRs, design/vision docs ("north star" files),
   findings/post-mortem docs, inline module READMEs. These carry the *why* that code cannot.
   A repo's own war-story docs (debugging journals, migration notes) are curriculum gold —
   flag them as primary resources.
2. **Structure.** Top-level layout, package/module boundaries, build files, schemas/contracts,
   entry points. If a knowledge-graph tool is configured for the repo (e.g. a `graphify-out/`
   directory), query it before grepping raw source.
3. **Code, selectively.** Read the files that structure says are load-bearing: entry points,
   the largest/most-imported modules, anything named in docs. You are not auditing — you are
   mapping what a learner must eventually read.
4. **History, lightly.** `git log --oneline -30` and the merge summary show what the project
   has been fighting with lately — often the best clue to what is hard about it.
5. **The repo's existing diagrams — audited, not trusted.** Inventory docs/ images, README
   ASCII art, and wiki figures. For each: does it match the CURRENT code (module names,
   stages, "future work" labels that have since shipped)? Record accurate ones as raw
   material for the curriculum's diagrams, and stale ones as findings in the plan doc —
   offer to refresh them in the host repo (in their own visual style) if the user wants.

## What to extract

### The spine (system map)

Every repo has one dominant flow: request→response, source→build→artifact, intent→execution,
data→model→render, event→state→effect. Find it and write it as 5–9 ordered stages, each
naming a real file. This becomes `pipeline.ts` and the dashboard's signature schematic — and,
more importantly, the curriculum's organizing mental model. If you cannot find a single spine,
the repo may be several systems; say so and organize phases per subsystem.

### Concept clusters → tracks

List the concepts someone must hold to work on this repo confidently. Two kinds, both required:

- **Repo-internal**: its architecture patterns, its contracts, its subsystems, its tooling.
- **Underneath-knowledge**: the theory, protocols, algorithms, and ecosystem the repo is
  built ON — the things its authors knew that a reader might not (e.g. for a drone stack:
  PID control, MAVLink, path-planning algorithms; for a web app: HTTP caching, the rendering
  model, the DB's index behavior; for a compiler: parsing theory, IRs). **This is what makes
  a ground school worth building.** A curriculum with only repo-internal tracks is a README.

Cluster into tracks: one track = one coherent competence, 3–6 lessons, 2–12 focused hours.
Guidance on count: small repo 6–10 tracks, substantial repo 12–18. Group tracks into 4–6
phases with an arc (bedrock → core machinery → intelligence/domain → periphery → beyond-the-
repo). Order by dependency, not by directory listing.

### Per-track raw material

For every planned track record, in the plan doc:

- The anchor candidates (paths, with line numbers for specific seams) — **verify each exists**.
- The repo's own docs that belong in its resources.
- The external canon: the 1–3 papers/docs/videos that actually teach the underneath-knowledge.
  Prefer primary sources (the original paper, the official docs, the recognized lecture
  series). If the user's goals suggest video learning, hunt for the canonical lecture/talk —
  lessons support click-to-load YouTube embeds.
- One candidate prove-it: a change with an observable result.

### The learner

The user is usually the repo's owner wanting to *understand what they built* (possibly with
AI assistance) — but confirm the goal when ambiguous, because it reshapes the plan: extending
the repo (weight internal tracks), mastering the theory (weight underneath tracks), or
preparing for an external goal like new hardware or a migration (add forward-looking tracks
that the repo alone would not justify).

## The plan doc

`groundschool/docs/curriculum-plan.md`, structure:

```markdown
# <Repo> Ground School — curriculum plan
_<date> · baseline <branch>@<short-sha>_

## The spine
<the 5–9 stages, one line each: label — file — what happens>

## Learner & goal
<2–3 sentences: who, and what studying this leads to>

## Phases and tracks
| # | Track | Phase | hrs | diff | depends | one-line scope |
...

## Per-track notes
### T00 <name>
anchors: <verified paths>
resources: <repo docs + external canon>
prove-it candidate: <one>
...

## Aesthetic notes
<wordmark name, eyebrow, motto, status chips, system-map title/flow labels — see design.md>
```

Sanity-check the table before authoring: total hours honest? every track's "depends" earlier
than it? at least a third of the tracks teaching underneath-knowledge? phases telling an arc?
Fix the plan, not the prose later.
