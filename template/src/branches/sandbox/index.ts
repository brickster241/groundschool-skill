import type { BranchBundle } from '../../data/types'

/**
 * A deliberately tiny second branch, self-contained in one file. It exists to
 * demonstrate (and exercise) branch coexistence: the sidebar switcher appears
 * whenever more than one branch is registered, progress/notes are kept per
 * branch, and optional features (planner, pipeline, quizzes) hide when their
 * data is empty. A real second branch would mirror main/'s folder layout.
 */
export const bundle: BranchBundle = {
  meta: {
    repoName: 'EXAMPLE',
    title: 'Example Ground School — sandbox',
    eyebrow: 'A second branch, coexisting',
    intro:
      'This is the `sandbox` branch curriculum. Switch back to `main` in the sidebar — progress and notes are tracked separately per branch.',
    repoPath: '~/Coding/example',
    repoPathAbs: '/Users/you/Coding/example',
    statusChips: [],
    motto: 'ONE APP · MANY BRANCHES · PROGRESS PER BRANCH',
    systemMapTitle: 'System map',
    systemMapFlow: 'input ▼ output ▲',
    editor: 'vscode',
    baseline: { branch: 'sandbox', commit: '0000000', date: '1970-01-01' },
  },
  phases: [
    { id: 'solo', name: 'Solo', blurb: 'The one phase this tiny branch has.', color: '#7dd3fc' },
  ],
  tracks: [
    {
      id: 't00',
      num: 0,
      slug: 'sandbox-track',
      title: 'Sandbox Track',
      tagline: 'Proof that a second branch curriculum coexists with main.',
      phase: 'solo',
      hours: [1, 2],
      difficulty: 1,
      dependsOn: [],
      mentalModel:
        'Each branch folder under `src/branches/` ships a full, independent curriculum bundle. The registry in `src/branches/index.ts` lists them; the shell renders whichever is active.',
      why:
        'Branch curricula must coexist because long-lived branches can diverge architecturally — a dashboard teaching `main` may be wrong about `develop`. Separate bundles keep each honest.',
      anchors: [{ path: 'README.md', note: 'Any file — this branch is a demo.' }],
      lessons: [
        {
          title: 'Switch branches, keep progress',
          summary: 'Check an item here, switch to main, come back — the check survives, per branch.',
          items: [
            { kind: 'run', text: 'Check this item, switch branch in the sidebar, switch back' },
            { kind: 'quiz', text: 'Where does per-branch progress live?', detail: 'One localStorage entry for the whole app, sliced by branch name inside the store.' },
          ],
        },
      ],
      deepDive: { title: 'Nothing deeper here', body: 'A real branch would earn one.' },
      proveIt: ['Add a third branch folder and register it — the switcher grows by itself.'],
      resources: [],
    },
  ],
  planner: [],
  glossary: [
    { term: 'Branch bundle', def: 'One branch\'s complete curriculum: meta, phases, tracks, decks — everything the shell needs.', trackId: 't00' },
  ],
  pipeline: [],
  quizzes: {},
  flashcards: {
    t00: [
      { front: 'Sandbox card: what proves branch isolation?', back: 'Flip a card here, switch to main — main\'s decks are untouched. Content and progress are both per-branch.' },
    ],
  },
}
