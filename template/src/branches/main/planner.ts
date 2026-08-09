import type { WeekPlanDraft } from '../../data/types'

/**
 * OPTIONAL study schedule. Leave the array EMPTY to hide the planner
 * entirely (nav item and route show nothing when there are no weeks).
 */
export const plannerDrafts: WeekPlanDraft[] = [
  {
    week: 1,
    focus: 'The data model and its law',
    trackIds: ['t00'],
    items: [
      { kind: 'run', text: 'Run the template, tick items, find them in localStorage' },
      { kind: 'read', text: 'Read assembleTrack and the TrackDraft type side by side' },
      { kind: 'write', text: 'Write the reordering failure story in your own words' },
    ],
  },
  {
    week: 2,
    focus: 'Where the app meets the browser',
    trackIds: ['t01', 't02'],
    items: [
      { kind: 'run', text: 'Run the framing probe; check every allow-list entry still holds' },
      { kind: 'run', text: 'curl /__open with a traversal path and read the refusal' },
      { kind: 'build', text: 'Add one editor to the table, end to end' },
    ],
  },
  {
    week: 3,
    focus: 'Change without betrayal',
    trackIds: ['t03', 't04'],
    items: [
      { kind: 'read', text: 'Read update.md as if you were about to run it on a year-old instance' },
      { kind: 'build', text: 'Deprecate a lesson in a scratch copy; verify banner + surviving ticks' },
    ],
  },
]
