import type { GlossaryTerm } from '../../data/types'

export const glossary: GlossaryTerm[] = [
  { term: 'Track', def: 'One teachable subject: mental model, why, anchors, lessons, deep dive, prove-its.', trackId: 't00' },
  { term: 'Lesson', def: 'One sitting \u2014 a titled checklist of typed items with a briefing paragraph.', trackId: 't00' },
  { term: 'Positional id', def: 'An item\u2019s identity derived from its place: t02.1.3 = track, lesson, item. The reason structure is append-only.', trackId: 't00' },
  { term: 'Append-only law', def: 'Existing lessons and items are never deleted, reordered or renumbered \u2014 saved progress points at positions.', trackId: 't00' },
  { term: 'Deprecation', def: 'How content leaves a curriculum: a dated banner and a pointer to the replacement, never removal.', trackId: 't03' },
  { term: 'Anchor', def: 'A verified path (optionally :line) into the host repo, attached to a track and openable in the editor.', trackId: 't02' },
  { term: 'Editor bridge', def: 'The dev-server endpoint (/__open) that runs the editor CLI, replacing unreliable protocol URLs.', trackId: 't02' },
  { term: 'Allow-list', def: 'The measured set of hosts whose pages render in an iframe; everything else links out honestly.', trackId: 't01' },
  { term: 'Framing headers', def: 'X-Frame-Options and CSP frame-ancestors \u2014 the response headers that veto embedding, undetectably from JS.', trackId: 't01' },
  { term: 'Baseline', def: 'The branch@commit a curriculum was authored against; UPDATE diffs from here.', trackId: 't03' },
  { term: 'Shell', def: 'Everything under src/ except src/branches/ \u2014 skill-owned, overwritten wholesale on UPDATE.', trackId: 't03' },
  { term: 'Branch bundle', def: 'One branch\u2019s complete curriculum: meta, phases, tracks, glossary, decks, quizzes, diagrams.', trackId: 't00' },
  { term: 'Checkride', def: 'A per-track multiple-choice exam with explanations; best score persists.', trackId: 't04' },
  { term: 'Flash deck', def: 'Per-track recall cards plus the glossary deck; ephemeral by design \u2014 revision is a workout, not a ledger.', trackId: 't04' },
  { term: 'Prove-it', def: 'A change-one-thing exercise with an observable result. If a track can\u2019t have one, the track is too abstract.', trackId: 't04' },
  { term: 'Store key', def: 'The localStorage key holding all progress for one dashboard; unique per repo so instances never collide.', trackId: 't00' },
]
