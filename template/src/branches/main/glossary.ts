import type { GlossaryTerm } from '../../data/types'

/**
 * EXAMPLE — replace with the repo's real vocabulary (aim for 40–80 terms).
 * One sentence per term; link the owning track via trackId when one exists.
 */
export const glossary: GlossaryTerm[] = [
  { term: 'Example term', def: 'One-sentence definition a newcomer can hold. Precise beats complete.', trackId: 't00' },
  { term: 'Anchor', def: 'A path into the host repo attached to a track — copyable, and deep-linkable into your editor.' },
]
