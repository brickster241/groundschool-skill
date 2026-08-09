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

**quizzes.ts** — the Checkrides: `Record<trackId, QuizQuestion[]>`, the single authoring
location (never inline on tracks; the assembler attaches them, and UPDATE can evolve quizzes
without touching track files). Quizzes are **optional per track** and **concept-weighted,
not flat**: a bedrock concept that must not be learnt lightly (frames, the control cascade,
the offboard contract, safety-critical hardware knowledge) earns 7–10+ questions; a bridging
track earns 3–4 or none. Weight by importance, not by track size.

- Test the *concept*, not recall — a question answerable by grepping belongs in a `read` item.
- Every distractor is a **real misconception** a partial understanding would pick (the NED
  classic: "climb to 30 m means D = +30"). Filler options teach nothing and flatter scores.
- `explain` teaches why the right answer is right — it is read most often after a *miss*,
  so write it for the person who just picked the misconception.
- Best scores persist per track; retakes only improve the record, so hard questions are fine.
- A track without an entry shows no Checkride — better none than trivia.

**flashcards.ts** — the revision decks: `Record<trackId, Flashcard[]>`, same central-file
rule as quizzes. Flashcards are the quick-revision layer (the Revision page aggregates every
deck plus an auto-built glossary deck; track pages show their own deck) — author them for
**every substantial track**:

- Front = ONE prompt: a question, a term, a scenario ("GPS dies mid-flight — what does the
  estimate do?"). If the front needs two sentences, it is two cards.
- Back = the crisp answer you want producible from memory, three sentences max.
- Deck depth is concept-weighted like quizzes: deep decks for bedrock concepts, a few cards
  for bridging material. Formulas, sign conventions, failure chains, and "what does X stand
  for + why it matters" all make excellent cards.
- Don't duplicate the glossary — its deck is auto-generated. Track cards should test
  *relationships and behavior*, not term definitions.

**diagrams.ts** — architecture diagrams: `Record<trackId, DiagramSpec[]>`, SVGs authored in
the branch's `diagrams/` folder and imported with `?raw` (rendered inline, so the app's fonts
and palette apply; lightbox for free). Text-only learning goes flat — give every
architecture-heavy track at least one diagram. The bar:

- **Accuracy is the entire point.** Derive the diagram FROM the code, then verify every
  box/label names a real module, file, or topic (same rule as code anchors). A wrong diagram
  is worse than none — it teaches confidently and falsely.
- **Audit the repo's own diagrams first** (docs/, README ASCII art, wiki images — see
  analysis.md). Accurate ones: reference or adapt. Stale ones: flag them to the user and
  update them in the host repo if authorized — and never copy their staleness into yours.
- Visual language (spec in design.md, example in the template): night-cockpit palette,
  mono labels, amber = the one main flow, hairline module boxes with hud-blue file paths,
  dashed = return/feedback paths. One idea per diagram; 5–12 boxes; viewBox ~860 wide.
- Caption states what the reader should SEE ("note the estimator sits outside the command
  path"), not what the diagram is.

**meta.ts** — every field, from the plan doc's aesthetic notes. `motto` is three short mono
clauses that capture the repo's philosophy (an original: "SIMULATION-FIRST · HARDWARE
WHEN IT IS THE ONLY THING LEFT · NED EVERYWHERE"). `statusChips` only for real, earned claims
("3/3 REPRODUCIBLE", "CI GREEN ON MAIN") — empty array beats decoration.

## Scale discipline

Track counts come from the plan. Within them: a big flagship track (the repo's hardest
subsystem) may run 5–6 lessons and 20+ items; a bridging track may be 3 lessons and 10.
Do not pad tracks to uniform length — pad is instantly visible to the person doing the
checklists. Total item count lands naturally in the 150–350 range for a substantial repo.
