import { useState } from 'react'
import { Play } from 'lucide-react'
import type { LessonVideo } from '../data/types'

/**
 * Click-to-load YouTube embed: renders a quiet placard until clicked, so the
 * app makes zero network requests (and shows no third-party content) until
 * the learner asks for it.
 */
export function VideoEmbed({ video }: { video: LessonVideo }) {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className="flex w-full items-center gap-3 border-t border-line/60 px-4 py-3 text-left transition-colors hover:bg-panel2"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber/40">
          <Play className="ml-0.5 h-3.5 w-3.5 text-amber" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-ink">{video.label}</span>
          <span className="block font-mono text-[10px] tracking-wider text-faint">
            YOUTUBE · CLICK TO LOAD
          </span>
        </span>
      </button>
    )
  }

  const src = `https://www.youtube-nocookie.com/embed/${video.youtubeId}${
    video.start ? `?start=${video.start}` : ''
  }`
  return (
    <div className="border-t border-line/60 p-3">
      <div className="aspect-video overflow-hidden rounded-lg border border-line">
        <iframe
          src={src}
          title={video.label}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
