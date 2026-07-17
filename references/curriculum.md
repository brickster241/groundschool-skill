# Curriculum authoring — spec and quality bar

Content lives in `src/data/`: one file per track (`tracks/tNN.ts`), plus `pipeline.ts`,
`glossary.ts`, `planner.ts`, and the phase list + imports in `curriculum.ts`. The example
track bundled with the template demonstrates every supported field — mirror its shape,
replace its content. The `types.ts` doc comments are the field-level spec; this file is the
*quality* spec.

## The iron rule of IDs

Checklist IDs derive from position (`t03.1.2` = track t03, lesson 1, item 2). Saved progress
is keyed on them. Therefore: **append new lessons/items at the end; never reorder, never
delete, never renumber tracks.** Retiring content = `status: 'deprecated'` + dated
`statusNote` (see update.md). State this rule in the generated README.

## Voice

Write like a senior engineer explaining their own system to a smart friend — direct, concrete,
occasionally funny, never corporate. Use `code` for identifiers, **bold** for the load-bearing
terms, *italic* for emphasis (single newline-separated paragraphs with `\n\n`). Every
abstraction gets grounded in THIS repo within a sentence or two. If a paragraph would be true
of any repo, it is filler — cut it.

## Per-field quality bar

**tagline** — one sentence a stranger understands; scope + why it matters.

**mentalModel** (2–4 paragraphs) — the concept in plain language, then its shape in this repo,
then the one non-obvious thing about how the parts fit. This is teaching, not summarizing:
name the confusion a newcomer would have and dissolve it.

**why** (1 paragraph, mandatory, the soul of the format) — the engineering reason the repo
does it this way: the trade-off taken, the alternative rejected, the invariant protected.
Test: could a reader defend the design in a review after reading it?

**anchors** — 2–8 paths, each with a note saying why the learner opens it. Verified to exist.
Add `line:` for a specific seam worth deep-linking. Order by reading order, not alphabetically.

**lessons** (3–6 per track) — one sitting each. `summary` briefs the sitting; items are the
work:

- `read` — a file/doc with a goal ("find where X happens", not "read X").
- `run` — a command with observable output; put the exact command in `detail`.
- `build` — write something small: a toy version, a 20-line script, a plot.
- `quiz` — answerable from the reading; **the answer goes in `detail`** (revealed on expand).
- `watch` — a video; or attach `video: { youtubeId, label }` to the lesson for an inline
  click-to-load embed. Only canonical material (the original lecture, the recognized series).
- `write` — produce notes: a prediction, a runbook, an explanation (the Feynman test).

4–8 items per lesson. Mix kinds — a lesson of six `read`s is a syllabus, not a lesson.
The strongest recurring pattern: *predict → run/read → reconcile* (write down what you expect
before looking; the gap is the lesson).

**deepDive** — second-pass material: theory, proofs, "what else exists" surveys, the road not
taken. Clearly optional; never required by checklists. End with a concrete exercise when one
exists.

**proveIt** (2–3) — change one thing, observe the result: "change X, predict Y, run, compare".
If you cannot write one, the track is too abstract — restructure it.

**resources** — the repo's own docs first (they beat tutorials: they describe THIS system),
then the external canon. Every URL you can verify, verify. No listicles, no SEO farms.

**hours / difficulty** — honest. A learner who budgets a weekend on your numbers should not
discover they lied.

## The supporting files

**pipeline.ts** — the spine from the plan doc: 5–9 stages, each naming a real file and linking
a real track slug. Stage `sub` lines are one clause each. `meta.systemMapTitle` names the
schematic in the repo's own vocabulary ("Mission pipeline", "Request lifecycle", "Build
graph"); `meta.systemMapFlow` labels the two directions of flow.

**glossary.ts** — 40–80 terms, one sentence each, precise beats complete. Include the repo's
private vocabulary (its module names, its invariant phrases) alongside the domain terms.
Link `trackId` when a track owns the term.

**planner.ts** — optional. Author an N-week pass when the curriculum has a natural sequence
worth pacing (run-it-first week 1, spine weeks in the middle, beyond-the-repo last); export
`[]` to hide the page entirely. Week items reference the tracks (`trackIds`) but carry their
own short checklist.

**meta.ts** — every field, from the plan doc's aesthetic notes. `motto` is three short mono
clauses that capture the repo's philosophy (the AMOS original: "SIMULATION-FIRST · HARDWARE
WHEN IT IS THE ONLY THING LEFT · NED EVERYWHERE"). `statusChips` only for real, earned claims
("3/3 REPRODUCIBLE", "CI GREEN ON MAIN") — empty array beats decoration.

## Scale discipline

Track counts come from the plan. Within them: a big flagship track (the repo's hardest
subsystem) may run 5–6 lessons and 20+ items; a bridging track may be 3 lessons and 10.
Do not pad tracks to uniform length — pad is instantly visible to the person doing the
checklists. Total item count lands naturally in the 150–350 range for a substantial repo.
