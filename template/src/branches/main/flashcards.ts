import type { Flashcard } from '../../data/types'

/** One deck per track; the Revision page adds the glossary deck automatically. */
export const flashcards: Record<string, Flashcard[]> = {
  t00: [
    { front: 'What does the id t02.1.3 encode?', back: 'Track t02, second lesson, fourth item. Position is the entire identity \u2014 no lookup table exists.' },
    { front: 'Where does progress live?', back: 'In the reader\u2019s browser: localStorage under the storeKey, one slice per branch. No server ever sees it.' },
    { front: 'Why is reordering lessons forbidden?', back: 'Saved ids are positional \u2014 reordering re-points a stranger\u2019s ticks at content they never did, with no error.' },
    { front: 'How does content leave a curriculum?', back: 'Deprecation: status + a dated note naming the replacement. Never deletion.' },
  ],
  t01: [
    { front: 'How does a page detect a blocked iframe?', back: 'It cannot. load fires, no error fires, contentDocument throws either way. The decision must be made before render.' },
    { front: 'Why is arXiv /abs/ rewritten to /pdf/?', back: '/abs/ forbids framing (frame-ancestors \u2019none\u2019); /pdf/ permits it and serves inline. Same paper, opposite headers.' },
    { front: 'Default action for a resource with a URL?', back: 'Open in a new tab. The inline preview is an opt-in chip, offered only for hosts measured to allow framing.' },
    { front: 'Why GET with redirects in the probe, not HEAD?', back: 'HEAD may omit security headers and the blocking header rides the final response. Shortcuts produce confident false FRAMEABLEs.' },
  ],
  t02: [
    { front: 'Why not vscode:// links?', back: 'Unrememberable permission prompt on http origins, resolved on the viewing device not the repo machine, and silent when they fail.' },
    { front: 'Who opens the file instead?', back: 'The dev server \u2014 POST /__open runs the editor\u2019s CLI on the machine that holds the repo and returns a status the row can show.' },
    { front: 'Name the four request guards.', back: 'Loopback-only callers; fixed editor table; absolute path contained in the repo (path.relative); file must exist.' },
    { front: 'When is the protocol URL still used?', back: 'Only when the response proves no plugin answered \u2014 a statically served copy. Detected by body shape, not status code.' },
  ],
  t03: [
    { front: 'What does UPDATE do before touching curriculum?', back: 'Re-syncs the app shell from the template. Instances are copies; without this every dashboard keeps the bugs it was born with.' },
    { front: 'Which files does an UPDATE never touch?', back: 'src/branches/** \u2014 plus the instance\u2019s title, package name, README, CHANGELOG and docs.' },
    { front: 'DRIFTED vs BROKEN?', back: 'Drifted: anchored files changed, concepts hold \u2014 correct prose, update lines. Broken: an anchor path no longer exists \u2014 re-point or deprecate.' },
  ],
  t04: [
    { front: 'What belongs on the FRONT of a flashcard?', back: 'One prompt: a question, a term, or a scenario. If the front needs two sentences, it is two cards.' },
    { front: 'What belongs on the BACK?', back: 'The crisp answer \u2014 three sentences max, the thing you want to be able to say from memory.' },
  ],
}
