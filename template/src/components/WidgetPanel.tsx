import React from 'react'
import { Activity, TriangleAlert } from 'lucide-react'
import type { WidgetSpec } from '../data/types'

/**
 * The frame around a branch-owned interactive instrument.
 *
 * Widgets are curriculum code, written by whoever authored the branch, and
 * they run in the learner's page. A thrown render must cost one panel, not
 * the whole track — hence the boundary. The error state names the widget and
 * shows the message, because "something went wrong" teaches nothing and the
 * person most likely to see it is the author previewing their own work.
 */
class WidgetBoundary extends React.Component<
  { title: string; children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null }
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  render() {
    if (this.state.error !== null) {
      return (
        <div className="flex items-start gap-2.5 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
          <p className="text-[12px] leading-relaxed text-dim">
            The instrument <span className="text-warn">{this.props.title}</span> crashed:{' '}
            <span className="font-mono text-[11px]">{this.state.error}</span>. Reload the page to
            reset it.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

/** Placard-framed instrument: title bar, the live component, optional caption. */
export function WidgetPanel({ spec }: { spec: WidgetSpec }) {
  const Body = spec.component
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-panel">
      <figcaption className="flex items-center gap-2 border-b border-line px-4 py-2">
        <Activity className="h-3.5 w-3.5 text-amber" />
        <span className="placard">INSTRUMENT — {spec.title}</span>
      </figcaption>
      <div className="p-4">
        <WidgetBoundary title={spec.title}>
          <Body />
        </WidgetBoundary>
      </div>
      {spec.caption && (
        <p className="border-t border-line/60 px-4 py-2 text-[12px] leading-relaxed text-dim">
          {spec.caption}
        </p>
      )}
    </figure>
  )
}
