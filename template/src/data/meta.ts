import type { Meta } from './types'

/**
 * EXAMPLE meta — replace every field when instantiating for a real repo.
 * This file is the only place the app shell reads branding/config from.
 */
export const meta: Meta = {
  repoName: 'EXAMPLE',
  title: 'Example Ground School',
  eyebrow: 'Read the system you already built',
  intro:
    'The fundamentals under `~/Coding/example` — replace this intro with two sentences that name the repo, what it does, and what studying it leads to.',
  repoPath: '~/Coding/example',
  repoPathAbs: '/Users/you/Coding/example',
  storageKey: 'groundschool-example-v1',
  statusChips: [],
  motto: 'READ THE CODE · PROVE IT BY CHANGING ONE THING · WRITE IT DOWN',
  systemMapTitle: 'System map — the one mental model',
  systemMapFlow: 'input ▼ output ▲',
  editor: 'vscode',
  baseline: { branch: 'main', commit: '0000000', date: '1970-01-01' },
}
