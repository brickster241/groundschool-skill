import type { TrackDraft } from '../types'

/**
 * EXAMPLE TRACK — replace with real curriculum when instantiating.
 *
 * This file demonstrates every authoring feature the template supports:
 * multi-paragraph mental model with code/bold/italic inline formatting,
 * code anchors (with optional line for editor deep-links), all six item kinds,
 * quiz answers in `detail`, a click-to-load YouTube embed, per-lesson and
 * per-track resources, deep dive, prove-its, and (commented) deprecation.
 *
 * See references/curriculum.md in the skill for the authoring quality bar.
 */
export const t00: TrackDraft = {
  id: 't00',
  num: 0,
  slug: 'example-track',
  title: 'Example Track',
  tagline: 'One sentence a stranger understands: what this track teaches and why it is first.',
  phase: 'bedrock',
  hours: [2, 4],
  difficulty: 1,
  dependsOn: [],
  mentalModel:
    'Two or three paragraphs of plain language. Name the concept, then the shape of it in THIS repo. Use `code spans` for identifiers, **bold** for the load-bearing terms a learner should retain, and *italics* for emphasis.\n\nThe second paragraph usually answers: what are the moving parts, and what is the one non-obvious thing about how they fit? Write for a smart friend who has not seen the repo.',
  why:
    'One paragraph: the engineering reason THIS repo does it this way — the trade-off taken, the alternative rejected, the invariant protected. This section is mandatory; it is what separates a curriculum from documentation.',
  anchors: [
    { path: 'README.md', note: 'What this file is and why the learner opens it.' },
    { path: 'src/main.ts', line: 42, note: 'Anchors can carry a line number — deep-links open the editor there.' },
  ],
  lessons: [
    {
      title: 'A lesson is a sitting: one concept, checkable',
      summary:
        'A one-paragraph brief for the lesson: what the learner will be able to do afterwards, and the order of attack. Lessons render as challenge/response checklists — the summary is the briefing before the card.',
      items: [
        { kind: 'read', text: 'READ items point at a file or doc, with a goal', detail: 'The detail row carries the "what to look for" — or for quiz items, the answer.' },
        { kind: 'run', text: 'RUN items are commands with observable output', detail: 'Put the exact command here: `npm test -- --watch`' },
        { kind: 'build', text: 'BUILD items make the learner write something small' },
        { kind: 'quiz', text: 'QUIZ items ask a question answerable from the reading', detail: 'The answer lives here, revealed on expand.' },
        { kind: 'watch', text: 'WATCH items link a video (or use the lesson video embed below)' },
        { kind: 'write', text: 'WRITE items produce notes — predictions, runbooks, explanations' },
      ],
      video: {
        youtubeId: 'dQw4w9WgXcQ',
        label: 'Replace with a real lecture — embeds load only when clicked',
      },
      resources: [
        { label: 'Per-lesson resource', url: 'https://example.com', kind: 'doc', note: 'Optional note under the link.' },
      ],
    },
    {
      status: 'deprecated',
      statusNote: 'Example note: module removed in commit abc1234 — kept for learners mid-track.',
      title: 'Deprecation demo (this banner is what UPDATE produces)',
      summary:
        'When the UPDATE protocol finds a lesson whose subject left the codebase, it sets `status: "deprecated"` and a dated `statusNote` — never deletes. The UI shows a banner; progress and notes survive.',
      items: [
        { kind: 'quiz', text: 'Why deprecate instead of delete?', detail: 'Checklist IDs are positional — deletion orphans saved progress. And the learner may be mid-lesson: stale knowledge with a "this changed" flag beats a hole.' },
      ],
    },
  ],
  deepDive: {
    title: 'Optional depth, clearly gated',
    body:
      'The deep dive is where the theory, the proofs, or the "what else exists" survey lives — material for the second pass, never required for the checklists. One or two paragraphs; end with a concrete exercise when possible.',
  },
  proveIt: [
    'Prove-its are change-one-thing exercises with an observable result: change X, predict Y, run, compare.',
    'Two or three per track. If you cannot write one, the track is too abstract — fix the track.',
  ],
  resources: [
    { label: 'Track-level canonical resource', url: 'https://example.com', kind: 'doc' },
    { label: 'A resource without a URL renders as a plain row', kind: 'book', note: 'Use for books/papers cited by name.' },
  ],
}
