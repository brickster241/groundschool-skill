import type { Meta } from '../../data/types'

/**
 * This branch is the template's own curriculum — the skill run on itself.
 * When instantiating for a real repo, replace every field; the doc comments
 * on the Meta type are the spec.
 */
export const meta: Meta = {
  repoName: 'GROUNDSCHOOL',
  title: 'Groundschool Ground School',
  eyebrow: 'The skill, run on its own code',
  intro:
    'The machinery under this template — positional identity, the embed allow-list, the editor bridge, and the update law. Every anchor points at a file in this repository.',
  repoPath: '~/.claude/skills/groundschool',
  repoPathAbs: '/Users/you/.claude/skills/groundschool',
  statusChips: ['SELF-HOSTING', 'ANCHORS VERIFIED'],
  motto: 'READ THE CODE \u00b7 PROVE IT BY CHANGING ONE THING \u00b7 WRITE IT DOWN',
  systemMapTitle: 'System map \u2014 how a curriculum gets made',
  systemMapFlow: 'generate \u25bc update \u25b2',
  editor: 'vscode',
  baseline: { branch: 'main', commit: 'f8a1fa3', date: '2026-08-09' },
}
