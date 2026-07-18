import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

/**
 * Numeric count-up on mount — the template's one anime.js flourish
 * (motion handles structural/spring animation; anime.js owns numeric
 * timelines). Respects prefers-reduced-motion. Use for static totals
 * only, not live counters — it always animates from zero.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = String(value)
      return
    }
    const counter = { v: 0 }
    const anim = animate(counter, {
      v: value,
      duration: 900,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = String(Math.round(counter.v))
      },
    })
    return () => {
      anim.pause()
    }
  }, [value])

  return (
    <b ref={ref} className={className}>
      0
    </b>
  )
}
