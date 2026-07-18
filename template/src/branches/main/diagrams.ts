import type { DiagramSpec } from '../../data/types'
import systemMap from './diagrams/system-map.svg?raw'

/**
 * Architecture diagrams, keyed by track id — rendered inline on the track
 * page right after the mental model, with a click-to-expand lightbox.
 * Author .svg files in diagrams/ using the night-cockpit language (see the
 * example and the skill's design.md), import with `?raw`, and attach here.
 * ACCURACY RULE: every box/label names a real module or file — derive
 * diagrams from the code, then verify each name exists.
 */
export const diagrams: Record<string, DiagramSpec[]> = {
  t00: [
    {
      title: 'System map — the example diagram language',
      caption:
        'Amber = the main flow; hairline boxes = modules (hud-blue file paths); dashed = return paths. Every label must name something real.',
      svg: systemMap,
    },
  ],
}
