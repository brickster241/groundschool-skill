import type { TrackDraft } from '../../../data/types'

/**
 * The template ships with a real curriculum: the skill run on its own code.
 * Tracks t00–t03 teach the template's actual machinery (every anchor exists),
 * and t04 is the authoring showcase that demonstrates every supported feature.
 * When instantiating for a real repo, delete this branch folder and author
 * fresh — see references/curriculum.md for the quality bar.
 */
export const t00: TrackDraft = {
  id: 't00',
  num: 0,
  slug: 'curriculum-data-model',
  title: 'The curriculum data model',
  tagline: 'Why a checklist ticked three weeks ago is still ticked — and what that costs authors.',
  phase: 'bedrock',
  hours: [1, 2],
  difficulty: 2,
  dependsOn: [],
  mentalModel:
    'A curriculum is plain TypeScript data: `TrackDraft`s that authors write, assembled at load time into `Track`s by `assembleTrack`. The assembly step does one load-bearing thing — it derives every checklist item\'s id from its **position**: `t02.1.3` means track `t02`, second lesson, fourth item. Nothing else identifies an item.\n\nProgress lives in the learner\'s browser under those ids, keyed per branch. There is no server; `zustand`\'s persist middleware writes straight to `localStorage`. That is what makes the dashboard local-first — and what makes item **position** a public contract.',
  why:
    'Positional ids are the cheapest stable identity that survives editing prose. The alternative — hand-assigned ids on every item — would make authors invent and maintain thousands of names nobody reads. The price is the **append-only law**: reordering or deleting an item silently re-points a stranger\'s saved progress at different content. The law is not a style preference; it is the data model\'s one invariant, and every UPDATE rule in the skill exists to protect it.',
  anchors: [
    { path: 'template/src/curriculum.ts', line: 39, note: 'The id derivation — three template literals are the entire identity scheme.' },
    { path: 'template/src/data/types.ts', note: 'TrackDraft vs Track: what authors write vs what the app renders.' },
    { path: 'template/src/store.ts', note: 'Per-branch slices; persist writes to localStorage under storeKey.' },
  ],
  lessons: [
    {
      title: 'From draft to rendered track',
      summary:
        'Follow one track through assembly: what the author writes, what the loader adds, and where the ids come from.',
      items: [
        { kind: 'read', text: 'Read `assembleTrack` in curriculum.ts end to end', detail: 'It is ~20 lines. Note what is derived (ids, item lists) and what passes through untouched.' },
        { kind: 'quiz', text: 'What does the id `t03.0.2` point at, exactly?', detail: 'Track t03, first lesson, third item. Position is the whole identity — there is no lookup table.' },
        { kind: 'run', text: 'Tick an item, reload the page, find it in devtools', detail: 'Application → Local Storage → the storeKey. The value is a map of positional ids to timestamps.' },
        { kind: 'quiz', text: 'Why does deleting a lesson corrupt progress without any error?', detail: 'Every later lesson shifts down one position, so saved ids now resolve to different items. Nothing detects it because the ids still exist.' },
      ],
    },
    {
      title: 'The append-only law',
      summary: 'The one rule that follows from the data model, and how content leaves a curriculum.',
      items: [
        { kind: 'read', text: 'Read the deprecation fields on Lesson in types.ts', detail: '`status: "deprecated"` plus a dated statusNote — the UI banners it, progress survives.' },
        { kind: 'quiz', text: 'A module was deleted from the host repo. What happens to its lesson?', detail: 'It is deprecated with a note naming the replacement, never removed. The learner may be mid-lesson; stale-but-flagged beats vanished.' },
        { kind: 'write', text: 'Write the failure story: what a learner sees if an UPDATE reorders lessons instead', detail: 'Work it through — ticks appear on items they never did, and their notes describe the wrong lesson. That story is why the law exists.' },
      ],
    },
  ],
  deepDive: {
    title: 'Why not content-hashed ids?',
    body:
      'Hashing an item\'s text would survive reordering — and break on every prose edit, which authors do constantly and reordering is forbidden anyway. Position is stable under the one mutation the law permits (append) and cheap under the one it encourages (editing text in place). The design chooses which change is expensive, and it chooses the rare one.',
  },
  proveIt: [
    'Append a third lesson to this track locally, rebuild, and confirm every existing tick survives. Then insert it FIRST instead and watch the ticks land on the wrong lessons.',
    'Change storeKey in branches/index.ts, reload, and explain where the progress "went".',
  ],
  resources: [
    { label: 'zustand persist middleware', url: 'https://zustand.docs.pmnd.rs/integrations/persisting-store-data', kind: 'doc' },
  ],
}
