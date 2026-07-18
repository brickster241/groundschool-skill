import type { WeekPlanDraft } from '../../data/types'

/**
 * OPTIONAL study schedule. Leave the array EMPTY to hide the planner
 * entirely (nav item and route show nothing when there are no weeks).
 * EXAMPLE — author a real N-week pass or export [].
 */
export const plannerDrafts: WeekPlanDraft[] = [
  {
    week: 1,
    focus: 'Boot & observe',
    trackIds: ['t00'],
    items: [
      { kind: 'run', text: 'Run the system once, end to end, before reading anything' },
      { kind: 'read', text: 'Read the repo README with the output fresh in mind' },
    ],
  },
]
