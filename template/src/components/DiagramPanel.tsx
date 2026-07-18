import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import DOMPurify from 'dompurify'
import { Maximize2, X } from 'lucide-react'
import type { DiagramSpec } from '../data/types'

/**
 * An architecture diagram: inline SVG (so the app's fonts/palette apply),
 * placard title, optional caption, and a click-to-expand lightbox.
 * SVGs are build-time authored assets; sanitized anyway as defense in depth.
 */
export function DiagramPanel({ d }: { d: DiagramSpec }) {
  const [open, setOpen] = useState(false)

  const clean = useMemo(
    () => DOMPurify.sanitize(d.svg, { USE_PROFILES: { svg: true, svgFilters: true } }),
    [d.svg],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
        <button
          onClick={() => setOpen(true)}
          className="diagram-svg block w-full cursor-zoom-in p-4"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
        {d.caption && (
          <p className="border-t border-line/60 px-4 py-2 text-[12px] leading-relaxed text-dim">
            {d.caption}
          </p>
        )}
      </figure>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              exit={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="diagram-svg mx-auto w-full max-w-6xl flex-1 overflow-auto px-6 pb-8"
              onClick={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: clean }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
