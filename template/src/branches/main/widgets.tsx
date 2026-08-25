import { useEffect, useRef, useState } from 'react'
import type { WidgetSpec } from '../../data/types'

/**
 * The demo instrument: proof that a widget is just a branch-owned React
 * component. Real branches author physics here — integrators, filters,
 * whatever the subject demands — and the shell only frames it.
 */
function SineScope() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [freq, setFreq] = useState(2)
  const [amp, setAmp] = useState(0.7)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width: w, height: h } = canvas
    ctx.clearRect(0, 0, w, h)
    // axis
    ctx.strokeStyle = '#232b38'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
    // trace
    ctx.strokeStyle = '#ffb454'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 0; x <= w; x++) {
      const y = h / 2 - amp * (h / 2 - 8) * Math.sin((freq * 2 * Math.PI * x) / w)
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }, [freq, amp])

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        className="w-full rounded-lg border border-line bg-night"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[10px] tracking-wider text-dim">
            CYCLES ACROSS THE SCOPE — {freq.toFixed(1)}
          </span>
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.1}
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
            className="mt-1 w-full accent-(--color-amber)"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] tracking-wider text-dim">
            AMPLITUDE — {amp.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={amp}
            onChange={(e) => setAmp(Number(e.target.value))}
            className="mt-1 w-full accent-(--color-amber)"
          />
        </label>
      </div>
    </div>
  )
}

/** t04 is the authoring showcase; its one widget demonstrates the contract. */
export const widgets: Record<string, WidgetSpec[]> = {
  t04: [
    {
      id: 'sine-scope',
      title: 'SINE SCOPE',
      caption:
        'Drag either slider and watch the trace re-render. A widget is plain branch-owned React: state in, canvas/SVG out, framed and crash-isolated by the shell.',
      component: SineScope,
    },
  ],
}
