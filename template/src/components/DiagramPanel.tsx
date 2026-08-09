import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import DOMPurify from 'dompurify'
import { Maximize2, X } from 'lucide-react'
import type { DiagramSpec } from '../data/types'
import { namespaceSvgIds } from '../lib/svgIds'
import { useScrollLock } from '../lib/scrollLock'

/**
 * An architecture diagram: inline SVG (so the app's fonts/palette apply),
 * placard title, optional caption, and a click-to-expand lightbox.
 * SVGs are build-time authored assets; sanitized anyway as defense in depth.
 */
export function DiagramPanel({ d }: { d: DiagramSpec }) {
  const [open, setOpen] = useState(false)
  // useId() emits framework-controlled punctuation (`:r0:` in React 18, and
  // nothing promises that shape stays). Strip anything that is not valid in an
  // id or a `url(#…)` reference rather than assuming which character to remove.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  // Two renderings of the same markup, so each gets its own id namespace —
  // see lib/svgIds.ts for what breaks when they share one.
  const clean = useMemo(
    () => DOMPurify.sanitize(d.svg, { USE_PROFILES: { svg: true, svgFilters: true } }),
    [d.svg],
  )
  const inlineSvg = useMemo(() => namespaceSvgIds(clean, `d${uid}i`), [clean, uid])
  const zoomSvg = useMemo(() => namespaceSvgIds(clean, `d${uid}z`), [clean, uid])

  /*
   * How wide this diagram refuses to go below on a phone.
   *
   * A blanket floor would be wrong: the same component renders 860×400
   * architecture schematics AND 20×20 inline glyphs, and stretching a glyph to
   * 560px is nonsense. Take the smaller of the diagram's own width and the
   * floor, so wide diagrams scroll and small ones are left alone.
   */
  const minWidth = useMemo(() => {
    const box = clean.match(/viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)/)
    const attr = clean.match(/\swidth="([\d.]+)/)
    const intrinsic = Number(box?.[1] ?? attr?.[1])
    return Number.isFinite(intrinsic) && intrinsic > 0 ? `${Math.min(intrinsic, 560)}px` : '0px'
  }, [clean])

  /*
   * Dragging a wide diagram sideways ends in a click, and a click used to mean
   * "open the lightbox" — so on a touch screen you could not read the far end
   * of a schematic without the overlay jumping in your face. Only treat it as
   * a click if the pointer barely moved.
   */
  const pressX = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useScrollLock(open)

  return (
    <>
      <figure className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <figcaption className="placard">{d.title}</figcaption>
          <button
            onClick={() => setOpen(true)}
            aria-label="Expand diagram"
            title="Expand"
            className="rounded p-1 text-faint transition-colors hover:text-amber"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {/*
          A div, not a button: this box scrolls horizontally, and a scroll
          container that is also the click target turns every swipe into an
          accidental zoom. The Expand control in the header stays the
          keyboard- and screen-reader-reachable way in.
        */}
        <div
          role="presentation"
          onPointerDown={(e) => { pressX.current = e.clientX }}
          onClick={(e) => {
            const from = pressX.current
            pressX.current = null
            if (from !== null && Math.abs(e.clientX - from) > 8) return
            setOpen(true)
          }}
          style={{ ['--diagram-min' as string]: minWidth }}
          className="diagram-svg block w-full cursor-zoom-in p-4"
          dangerouslySetInnerHTML={{ __html: inlineSvg }}
        />
        {d.caption && (
          <p className="border-t border-line/60 px-4 py-2 text-[12px] leading-relaxed text-dim">
            {d.caption}
          </p>
        )}
      </figure>

      {/* enter-only animation — exit-gated unmounts hang in throttled/hidden tabs */}
      {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="dialog"
            aria-modal="true"
            aria-label={d.title}
            className="fixed inset-0 z-50 flex flex-col bg-night/95 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <span className="placard">{d.title}</span>
              <button
                aria-label="Close"
                className="rounded p-1.5 text-dim transition-colors hover:text-ink"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              style={{ ['--diagram-min' as string]: minWidth }}
              className="diagram-svg mx-auto w-full max-w-6xl flex-1 overflow-auto px-6 pb-8"
              onClick={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: zoomSvg }}
            />
          </motion.div>
        )}
    </>
  )
}
