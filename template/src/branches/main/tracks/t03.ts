import type { TrackDraft } from '../../../data/types'

export const t03: TrackDraft = {
  id: 't03',
  num: 3,
  slug: 'update-protocol',
  title: 'UPDATE, and why progress is sacred',
  tagline: 'How a curriculum follows a moving repo without ever betraying a saved tick.',
  phase: 'change',
  hours: [1, 2],
  difficulty: 2,
  dependsOn: ['t00'],
  mentalModel:
    'A generated ground school is a **copy** of this template, not a link to it — so an instance never receives a fix unless something delivers one. UPDATE is that something, and it starts by re-syncing the app shell before touching a word of curriculum. The boundary is fixed: everything under `src/` except `src/branches/` is skill-owned and overwritten wholesale; `src/branches/**` is the instance\'s and never touched.\n\nThen the curriculum work: diff the host repo against the recorded baseline, classify each track — unaffected, drifted, broken, or new territory — and act per class. Prose may be corrected in place; structure may only be appended to. Content leaves by deprecation with a dated note, never by deletion, because progress is positional (t00) and lives in a browser nobody can see.',
  why:
    'Both halves answer the same failure mode: silent damage to someone you cannot observe. A hand-edited shell file is overwritten by the next sync without a sound — so shell fixes go to the template, where they reach every instance. A reordered lesson re-points saved ticks at content the learner never did — so structure is append-only. The protocol is a set of promises to a person the tool will never meet.',
  anchors: [
    { path: 'references/update.md', note: 'The full protocol: shell refresh, diff, classify, deprecate/append, re-baseline.' },
    { path: 'references/curriculum.md', note: 'The authoring bar every appended lesson must still clear — a stub track is worse than none.' },
    { path: 'template/src/data/types.ts', note: 'baseline on Meta; status/statusNote on Lesson — the fields UPDATE moves.' },
  ],
  lessons: [
    {
      title: 'The ownership boundary',
      summary: 'One rsync command encodes the whole shell/instance split. Understand it before running it.',
      items: [
        { kind: 'read', text: 'Read § 0 of references/update.md', detail: 'The rsync excludes branches/; the file lists exactly what is instance-owned. Everything else is fair game for overwrite.' },
        { kind: 'quiz', text: 'Where does a shell bug get fixed — the instance you found it in, or the template?', detail: 'The template, always. An instance fix helps one person until the next sync deletes it silently.' },
        { kind: 'quiz', text: 'A shell refresh adds a required field to Meta. What surfaces it, and where is it filled?', detail: 'The typecheck fails — deliberately. Fill it in the branch\'s own meta.ts; never soften the type.' },
      ],
    },
    {
      title: 'Classify, then act',
      summary: 'The four classes an update sorts every track into, and the one unforgivable move.',
      items: [
        { kind: 'read', text: 'Read the classification table in update.md', detail: 'UNAFFECTED / DRIFTED / BROKEN / NEW TERRITORY — each with its narrow permitted action.' },
        { kind: 'quiz', text: 'An anchored file was renamed. Which class, and what changes?', detail: 'BROKEN. The anchor is re-pointed at the successor path. Only if the subject itself left the repo does deprecation enter.' },
        { kind: 'quiz', text: 'Why must an appended lesson still teach, rather than summarize the diff?', detail: '"X was refactored" is a changelog entry. "How X works now, and why it moved" is a lesson. The bar does not drop because the occasion is maintenance.' },
        { kind: 'write', text: 'Draft the CHANGELOG entry for an imaginary update in study terms', detail: 'Name what to re-study and why — not which files changed. The learner reads this, not the diff.' },
      ],
    },
  ],
  deepDive: {
    title: 'What UPDATE refuses to automate',
    body:
      'The diff and the anchor checks are mechanical; the classification is not. Whether a changed file DRIFTED a track or BROKE it is a judgement about concepts, not paths — which is why the protocol is a checklist for a reader, not a script. The parts worth automating are automated; the part worth thinking about is left visibly manual.',
  },
  proveIt: [
    'Deprecate a lesson in a scratch copy and confirm: banner renders, its ticks survive, counts still add up.',
    'Run the § 0 rsync against a scratch instance with a deliberately hand-edited shell file, and watch the edit vanish — the failure § 0\'s red flag warns about.',
  ],
  resources: [
    { label: 'references/update.md', kind: 'doc', note: 'The protocol itself is the primary source; this track is its rationale.' },
  ],
}
